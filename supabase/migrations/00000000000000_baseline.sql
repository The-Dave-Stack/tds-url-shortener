-- Baseline migration to initialize the database schema

-- Enums
CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');

-- Tables
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role user_role NOT NULL DEFAULT 'USER',
  username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public.urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL,
  custom_alias TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

CREATE TABLE public.anonymous_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL,
  custom_alias TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id TEXT NOT NULL
);

CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT,
  ip TEXT,
  country TEXT
);

CREATE TABLE public.anonymous_daily_quota (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraints
ALTER TABLE public.anonymous_daily_quota ADD CONSTRAINT anonymous_daily_quota_client_id_date_key UNIQUE (client_id, date);

-- Add foreign key constraint for analytics
ALTER TABLE public.analytics ADD FOREIGN KEY (url_id) REFERENCES public.urls(id);

-- Functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.increment()
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_clicks(url_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.urls SET clicks = clicks + 1 WHERE id = url_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_anonymous_clicks(url_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.anonymous_urls SET clicks = clicks + 1 WHERE id = url_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_anonymous_quota(client_id_param text, date_param date)
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

-- Handle new user function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();