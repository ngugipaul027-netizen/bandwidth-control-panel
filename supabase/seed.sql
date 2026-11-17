-- Seed initial packages (device_limit = simultaneous Hotspot devices / shared-users)
INSERT INTO public.packages (name, description, price, duration_seconds, download_limit_mbPS, upload_limit_mbPS, device_limit)
VALUES
('Daily Basic', '1 Hour of high-speed internet (1 device)', 20, 3600, 5, 2, 1),
('Multi-Device (Sare Devices)', '7 Days unlimited, up to 4 simultaneous devices', 100, 604800, 10, 5, 4),
('Monthly Ultimate', '30 Days of unlimited internet (6 devices)', 500, 2592000, 20, 10, 6);
