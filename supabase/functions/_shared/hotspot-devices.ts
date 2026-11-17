/**
 * Hotspot multi-device slot logic (edge-function copy).
 * Keep in sync with src/lib/hotspot-devices.ts
 * PPPoE is intentionally out of scope.
 */

export type HotspotDevice = {
  mac_address: string;
  is_active: boolean;
};

export type ConnectDecision =
  | { allowed: true; action: 'reuse'; reason?: undefined }
  | { allowed: true; action: 'register'; reason?: undefined }
  | { allowed: false; action: 'reject'; reason: string };

export function normalizeMac(mac: string): string {
  const hex = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (hex.length !== 12) {
    throw new Error(`Invalid MAC address: ${mac}`);
  }
  return hex.match(/.{2}/g)!.join(':');
}

export function resolveDeviceLimit(
  packageDeviceLimit: number | null | undefined
): number {
  if (
    typeof packageDeviceLimit === 'number' &&
    Number.isFinite(packageDeviceLimit) &&
    packageDeviceLimit >= 1
  ) {
    return Math.floor(packageDeviceLimit);
  }
  return 1;
}

export function countActiveSlots(devices: HotspotDevice[]): number {
  return devices.filter((d) => d.is_active).length;
}

export function decideDeviceConnect(
  devices: HotspotDevice[],
  macAddress: string,
  deviceLimit: number
): ConnectDecision {
  const limit = resolveDeviceLimit(deviceLimit);
  const mac = normalizeMac(macAddress);
  const existing = devices.find(
    (d) => normalizeMac(d.mac_address) === mac
  );

  if (existing) {
    return { allowed: true, action: 'reuse' };
  }

  const active = countActiveSlots(devices);
  if (active >= limit) {
    return {
      allowed: false,
      action: 'reject',
      reason: `Device limit reached (${active}/${limit}). Disconnect a device to free a slot.`,
    };
  }

  return { allowed: true, action: 'register' };
}

export function applyConnect(
  devices: HotspotDevice[],
  macAddress: string
): HotspotDevice[] {
  const mac = normalizeMac(macAddress);
  const idx = devices.findIndex((d) => normalizeMac(d.mac_address) === mac);
  if (idx >= 0) {
    const next = devices.slice();
    next[idx] = { ...next[idx], is_active: true };
    return next;
  }
  return [...devices, { mac_address: mac, is_active: true }];
}

export function applyDisconnect(
  devices: HotspotDevice[],
  macAddress: string
): HotspotDevice[] {
  const mac = normalizeMac(macAddress);
  return devices.map((d) =>
    normalizeMac(d.mac_address) === mac ? { ...d, is_active: false } : d
  );
}

export function buildHotspotUserPayload(input: {
  username: string;
  password?: string;
  deviceLimit: number;
  profile?: string;
  comment?: string;
}): Record<string, string | number> {
  const sharedUsers = resolveDeviceLimit(input.deviceLimit);
  return {
    name: input.username,
    password: input.password ?? input.username,
    'shared-users': sharedUsers,
    profile: input.profile ?? 'default',
    comment: input.comment ?? `device_limit=${sharedUsers}`,
  };
}
