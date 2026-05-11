-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.active_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    phone_number TEXT UNIQUE,
    full_name TEXT,
    mac_address TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration_seconds BIGINT NOT NULL, -- e.g. 3600 for 1 hour
    download_limit_mbPS INT, -- Bandwidth limit
    upload_limit_mbPS INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages(id),
    amount NUMERIC NOT NULL,
    mpesa_receipt_number TEXT UNIQUE,
    checkout_request_id TEXT UNIQUE,
    phone TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    raw_callback_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Routers Table
CREATE TABLE IF NOT EXISTS public.routers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    api_port INT DEFAULT 8728,
    username TEXT,
    password_secret_name TEXT, -- Reference to a secret in Vault
    location TEXT,
    is_online BOOLEAN DEFAULT TRUE,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Active Sessions Table
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    router_id UUID REFERENCES public.routers(id) ON DELETE CASCADE,
    mikrotik_id TEXT, -- Internal ID from MikroTik
    bytes_in BIGINT DEFAULT 0,
    bytes_out BIGINT DEFAULT 0,
    uptime TEXT,
    ip_address TEXT,
    mac_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON public.payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_profile ON public.active_sessions(profile_id);

-- RLS Policies

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Packages: Everyone can view active packages
CREATE POLICY "Anyone can view active packages" ON public.packages
    FOR SELECT USING (is_active = TRUE);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = profile_id);

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = profile_id);

-- Routers: Only service role or admins (to be defined) can access
-- For now, restrict to authenticated for viewing, but in production this should be stricter
CREATE POLICY "Authenticated users can view routers" ON public.routers
    FOR SELECT USING (auth.role() = 'authenticated');