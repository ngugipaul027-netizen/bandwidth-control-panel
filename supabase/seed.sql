-- Seed initial packages (device_limit = simultaneous Hotspot devices / shared-users)
INSERT INTO public.packages (name, description, price, duration_seconds, download_limit_mbPS, upload_limit_mbPS, device_limit)
VALUES
('Daily Basic', '1 Hour of high-speed internet (1 device)', 20, 3600, 5, 2, 1),
('4days unlimited', '4 Days UNLIMITED, shared package — up to 2 simultaneous devices', 100, 345600, 10, 5, 2),
('Monthly Ultimate', '30 Days of unlimited internet (6 devices)', 500, 2592000, 20, 10, 6);
