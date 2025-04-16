-- Insert default app settings
INSERT INTO public.app_settings (key, value)
VALUES 
  ('anonymous_daily_limit', '{"limit": 50}'),
  ('site_settings', '{"name": "URL Shortener", "description": "A simple URL shortener app"}');