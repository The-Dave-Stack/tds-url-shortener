
-- Function to increment anonymous quota safely (upsert pattern)
CREATE OR REPLACE FUNCTION public.increment_anonymous_quota(client_id_param TEXT, date_param DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.anonymous_daily_quota (client_id, date, count)
  VALUES (client_id_param, date_param, 1)
  ON CONFLICT (client_id, date) 
  DO UPDATE SET count = public.anonymous_daily_quota.count + 1;
END;
$$;

-- Function to increment anonymous URL clicks
CREATE OR REPLACE FUNCTION public.increment_anonymous_clicks(url_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.anonymous_urls SET clicks = clicks + 1 WHERE id = url_id_param;
END;
$$;
