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

describe('multi-device connect / disconnect lifecycle', () => {
  const limit = 4;

  it('purchase → devices 1..N within limit succeed', () => {
    let devices: HotspotDevice[] = [];
    for (let i = 1; i <= limit; i++) {
      const mac = `AA:BB:CC:DD:EE:0${i}`;
      const decision = decideDeviceConnect(devices, mac, limit);
      assert.equal(decision.allowed, true);
      assert.equal(decision.action, 'register');
      devices = applyConnect(devices, mac);
    }
    assert.equal(countActiveSlots(devices), 4);
  });

  it('N+1 device is rejected without kicking existing devices', () => {
    const devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:03', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:04', is_active: true },
    ];
    const decision = decideDeviceConnect(
      devices,
      'AA:BB:CC:DD:EE:05',
      limit
    );
    assert.deepEqual(decision, {
      allowed: false,
      action: 'reject',
      reason:
        'Device limit reached (4/4). Disconnect a device to free a slot.',
    });
    assert.equal(devices.every((d) => d.is_active), true);
    assert.equal(countActiveSlots(devices), 4);
  });

  it('disconnect frees a slot for another device', () => {
    let devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:03', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:04', is_active: true },
    ];
    devices = applyDisconnect(devices, 'AA:BB:CC:DD:EE:02');
    assert.equal(countActiveSlots(devices), 3);
    assert.equal(
      devices.find((d) => d.mac_address === 'AA:BB:CC:DD:EE:02')?.is_active,
      false
    );

    const decision = decideDeviceConnect(
      devices,
      'AA:BB:CC:DD:EE:05',
      limit
    );
    assert.equal(decision.allowed, true);
    devices = applyConnect(devices, 'AA:BB:CC:DD:EE:05');
    assert.equal(countActiveSlots(devices), 4);
  });

  it('reconnect same registered device does not consume an extra slot', () => {
    let devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: false },
      { mac_address: 'AA:BB:CC:DD:EE:03', is_active: true },
    ];
    const before = countActiveSlots(devices);
    const decision = decideDeviceConnect(
      devices,
      'aa-bb-cc-dd-ee-02',
      limit
    );
    assert.deepEqual(decision, { allowed: true, action: 'reuse' });
    devices = applyConnect(devices, 'AA:BB:CC:DD:EE:02');
    assert.equal(countActiveSlots(devices), before + 1);
    assert.equal(devices.length, 3);
  });

  it('counts active devices only — not total registrations', () => {
    const devices: HotspotDevice[] = [
      { mac_address: 'AA:BB:CC:DD:EE:01', is_active: true },
      { mac_address: 'AA:BB:CC:DD:EE:02', is_active: false },
      { mac_address: 'AA:BB:CC:DD:EE:03', is_active: false },
    ];
    assert.equal(countActiveSlots(devices), 1);
    assert.equal(
      decideDeviceConnect(devices, 'AA:BB:CC:DD:EE:04', 2).allowed,
      true
    );
  });
});

describe('buildHotspotUserPayload', () => {
  it('sets MikroTik shared-users from package device_limit', () => {
    const payload = buildHotspotUserPayload({
      username: 'SHANICE',
      deviceLimit: 4,
    });
    assert.equal(payload['shared-users'], 4);
    assert.equal(payload.name, 'SHANICE');
  });

  it('does not default multi-device packages to shared-users=1', () => {
    assert.notEqual(
      buildHotspotUserPayload({ username: 'SHANICE', deviceLimit: 4 })[
        'shared-users'
      ],
      1
    );
  });
});
