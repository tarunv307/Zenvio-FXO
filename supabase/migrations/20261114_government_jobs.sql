-- ==============================================================================
-- Zenvio FXO: Government Jobs Architecture Migration
-- Safe Migration: Only creates the govt_jobs table if it does not already exist.
-- Does NOT drop or alter existing tables, users, or auth schemas.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.govt_jobs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  short_org TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  qualification TEXT NOT NULL,
  vacancies TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  last_date DATE NOT NULL,
  official_notification_url TEXT NOT NULL,
  official_apply_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  last_verified_date DATE NOT NULL,
  overview TEXT NOT NULL,
  official_summary TEXT NOT NULL,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  vacancy_breakdown JSONB DEFAULT '[]'::jsonb,
  application_fee JSONB DEFAULT '{}'::jsonb,
  important_dates JSONB NOT NULL DEFAULT '{}'::jsonb,
  selection_process TEXT[] DEFAULT ARRAY[]::TEXT[],
  salary JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_admit_card BOOLEAN DEFAULT FALSE,
  is_result BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_govt_jobs_category ON public.govt_jobs(category);
CREATE INDEX IF NOT EXISTS idx_govt_jobs_last_date ON public.govt_jobs(last_date);
CREATE INDEX IF NOT EXISTS idx_govt_jobs_featured ON public.govt_jobs(featured);
CREATE INDEX IF NOT EXISTS idx_govt_jobs_slug ON public.govt_jobs(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.govt_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all job postings
CREATE POLICY "Public read access for govt jobs"
  ON public.govt_jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated service role / admins to manage jobs
CREATE POLICY "Admin write access for govt jobs"
  ON public.govt_jobs
  FOR ALL
  TO service_role
  USING (true);

