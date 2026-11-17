export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_seconds: number;
  download_limit_mbps: number;
  upload_limit_mbps: number;
  /** Max simultaneous Hotspot devices (MikroTik shared-users). */
  device_limit: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  /** Captive-portal Username / Account Code (e.g. SHANICE). */
  account_code?: string;
  /** @deprecated Prefer devices[] — single MAC treated the account as 1-device. */
  mac_address?: string;
  device_type?: string;
  created_at: string;
}

export interface Device {
  id: string;
  profile_id: string;
  subscription_id?: string;
  mac_address: string;
  device_type?: string;
  ip_address?: string;
  is_active: boolean;
  last_seen_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'pending';
  package?: Package;
}

export interface Payment {
  id: string;
  profile_id: string;
  package_id: string;
  amount: number;
  mpesa_receipt_number?: string;
  checkout_request_id: string;
  phone: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  profile?: Profile;
  package?: Package;
}

export interface ActiveSession {
  id: string;
  profile_id: string;
  router_id: string;
  mikrotik_id: string;
  bytes_in: number;
  bytes_out: number;
  uptime: string;
  ip_address: string;
  mac_address: string;
  last_updated: string;
  profile?: Profile;
}
