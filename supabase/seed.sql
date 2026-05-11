-- Seed initial packages
INSERT INTO public.packages (name, description, price, duration_seconds, download_limit_mbPS, upload_limit_mbPS)
VALUES 
('Daily Basic', '1 Hour of high-speed internet', 20, 3600, 5, 2),
('Weekly Pro', '7 Days of unlimited internet', 100, 604800, 10, 5),
('Monthly Ultimate', '30 Days of unlimited internet', 500, 2592000, 20, 10);