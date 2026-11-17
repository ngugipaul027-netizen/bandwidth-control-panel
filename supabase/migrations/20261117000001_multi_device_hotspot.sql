-- Multi-device Hotspot support
-- Preserves PPPoE: no PPP tables or secrets are altered by this migration.

-- Package simultaneous device capacity (MikroTik hotspot shared-users).
-- Must never be silently overridden to 1 when a package declares a higher limit.
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS device_limit INT NOT NULL DEFAULT 1
  CHECK (device_limit >= 1);

COMMENT ON COLUMN public.packages.device_limit IS
  'Max simultaneous Hotspot devices for this package. Mapped to MikroTik ip/hotspot/user shared-users.';

-- Account code used on captive portal (Username / Account Code), e.g. SHANICE.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_account_code
  ON public.profiles (upper(account_code))
  WHERE account_code IS NOT NULL;

-- Registered Hotspot devices for a paid customer account.
-- Active rows hold a slot; disconnect sets is_active=false to free the slot.
-- Reconnecting the same MAC reuses the row and does not consume an extra slot.
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    mac_address TEXT NOT NULL,
    device_type TEXT,
    ip_address TEXT,
    mikrotik_host_id TEXT,
    mikrotik_active_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT devices_mac_format CHECK (mac_address ~* '^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_profile_mac
  ON public.devices (profile_id, upper(mac_address));

CREATE INDEX IF NOT EXISTS idx_devices_profile_active
  ON public.devices (profile_id)
  WHERE is_active = TRUE;

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON public.devices
    FOR SELECT USING (auth.uid() = profile_id);

-- Seed / backfill: ensure KES 100 multi-device package has device_limit > 1
UPDATE public.packages
SET device_limit = 4,
    name = CASE WHEN name = 'Weekly Pro' THEN 'Multi-Device (Sare Devices)' ELSE name END,
    description = CASE
      WHEN name = 'Weekly Pro' OR name = 'Multi-Device (Sare Devices)'
        THEN '7 Days unlimited, up to 4 simultaneous devices'
      ELSE description
    END
WHERE price = 100;

UPDATE public.packages SET device_limit = 1 WHERE price = 20 AND device_limit = 1;
UPDATE public.packages SET device_limit = 6 WHERE price = 500;

-- Keep active_sessions aligned 1:1 with a Hotspot MAC on an account
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_sessions_profile_mac
  ON public.active_sessions (profile_id, upper(mac_address))
  WHERE mac_address IS NOT NULL;
