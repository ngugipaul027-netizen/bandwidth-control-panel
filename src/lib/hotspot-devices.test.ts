import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyConnect,
  applyDisconnect,
  buildHotspotUserPayload,
  countActiveSlots,
  decideDeviceConnect,
  normalizeMac,
  resolveDeviceLimit,
  type HotspotDevice,
} from './hotspot-devices.ts';

describe('normalizeMac', () => {
  it('normalizes dash and lowercase forms', () => {
    assert.equal(normalizeMac('aa-bb-cc-dd-ee-01'), 'AA:BB:CC:DD:EE:01');
    assert.equal(normalizeMac('aabbccddee01'), 'AA:BB:CC:DD:EE:01');
  });

  it('rejects invalid MAC', () => {
    assert.throws(() => normalizeMac('bad'));
  });
});

describe('resolveDeviceLimit', () => {
  it('preserves multi-device package limits (never force 1)', () => {
    assert.equal(resolveDeviceLimit(2), 2);
    assert.equal(resolveDeviceLimit(4), 4);
    assert.equal(resolveDeviceLimit(8), 8);
  });

  it('floors fractional values', () => {
    assert.equal(resolveDeviceLimit(3.9), 3);
  });

  it('falls back to 1 only when unset/invalid', () => {
    assert.equal(resolveDeviceLimit(undefined), 1);
    assert.equal(resolveDeviceLimit(null), 1);
    assert.equal(resolveDeviceLimit(0), 1);
    assert.equal(resolveDeviceLimit(-2), 1);
  });
});

/** Incident package: 4days unlimited @ KES 100 — shared, device_limit=2 */
const FOUR_DAYS_UNLIMITED = {
  name: '4days unlimited',
  price: 100,
  duration_seconds: 345600, // 4 days
  device_limit: 2,
};

describe('4days unlimited shared-device lifecycle (device_limit=2)', () => {
  const limit = FOUR_DAYS_UNLIMITED.device_limit;

  it('catalog fields match incident package', () => {
    assert.equal(FOUR_DAYS_UNLIMITED.name, '4days unlimited');
    assert.equal(FOUR_DAYS_UNLIMITED.price, 100);
    assert.equal(FOUR_DAYS_UNLIMITED.duration_seconds, 4 * 24 * 60 * 60);
    assert.equal(FOUR_DAYS_UNLIMITED.device_limit, 2);
  });

  it('purchase → devices 1..2 within limit succeed', () => {
    let devices: HotspotDevice[] = [];
    for (let i = 1; i <= limit; i++) {
      const mac = `AA:BB:CC:DD:EE:0${i}`;
      const decision = decideDeviceConnect(devices, mac, limit);
      assert.equal(decision.allowed, true);
      assert.equal(decision.action, 'register');
      devices = applyConnect(devices, mac);
    }
    assert.equal(countActiveSlots(devices), 2);
  });

  it('3rd device is rejected without kicking existing devices', () => {
    const devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: true },
    ];
    const decision = decideDeviceConnect(
      devices,
      'AA:BB:CC:DD:EE:03',
      limit
    );
    assert.deepEqual(decision, {
      allowed: false,
      action: 'reject',
      reason:
        'Device limit reached (2/2). Disconnect a device to free a slot.',
    });
    assert.equal(devices.every((d) => d.is_active), true);
    assert.equal(countActiveSlots(devices), 2);
  });

  it('disconnect frees a slot for another shared device', () => {
    let devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: true },
    ];
    devices = applyDisconnect(devices, 'AA:BB:CC:DD:EE:01');
    assert.equal(countActiveSlots(devices), 1);

    const decision = decideDeviceConnect(
      devices,
      'AA:BB:CC:DD:EE:03',
      limit
    );
    assert.equal(decision.allowed, true);
    devices = applyConnect(devices, 'AA:BB:CC:DD:EE:03');
    assert.equal(countActiveSlots(devices), 2);
  });

  it('reconnect same registered device does not consume an extra slot', () => {
    let devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: false },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: true },
    ];
    const before = countActiveSlots(devices);
    const decision = decideDeviceConnect(
      devices,
      'aa-bb-cc-dd-ee-01',
      limit
    );
    assert.deepEqual(decision, { allowed: true, action: 'reuse' });
    devices = applyConnect(devices, 'AA:BB:CC:DD:EE:01');
    assert.equal(countActiveSlots(devices), before + 1);
    assert.equal(devices.length, 2);
  });

  it('counts active devices only — not total registrations', () => {
    const devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: false },
    ];
    assert.equal(countActiveSlots(devices), 1);
    assert.equal(
      decideDeviceConnect(devices, 'AA:BB:CC:DD:EE:03', limit).allowed,
      true
    );
  });
});

describe('buildHotspotUserPayload', () => {
  it('sets MikroTik shared-users=2 for 4days unlimited', () => {
    const payload = buildHotspotUserPayload({
      username: 'SHANICE',
      deviceLimit: FOUR_DAYS_UNLIMITED.device_limit,
    });
    assert.equal(payload['shared-users'], 2);
    assert.equal(payload.name, 'SHANICE');
  });

  it('does not default shared 4days package to shared-users=1', () => {
    assert.notEqual(
      buildHotspotUserPayload({
        username: 'SHANICE',
        deviceLimit: FOUR_DAYS_UNLIMITED.device_limit,
      })['shared-users'],
      1
    );
  });
});
