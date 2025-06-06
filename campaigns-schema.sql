-- Historical Campaigns Database Schema
-- This creates the tables needed to store campaign and milestone data

-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, -- friendly URL identifier (e.g., 'trung-sisters')
  title text NOT NULL,
  period text NOT NULL, -- historical period (e.g., '40-43 AD')
  description text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text, -- optional smaller image for lists
  display_order integer NOT NULL DEFAULT 0, -- for ordering campaigns
  category text NOT NULL DEFAULT 'history'::text CHECK (category = ANY (ARRAY['history'::text, 'culture'::text])),
  tags text[] DEFAULT '{}', -- array of tags for categorization
  location text, -- geographical location
  historical_significance text, -- longer description of importance
  is_active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false, -- for highlighting special campaigns
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id)
);

-- Milestones table
CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  slug text NOT NULL, -- unique within campaign (e.g., 'call-to-arms')
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text, -- optional smaller image
  display_order integer NOT NULL DEFAULT 0, -- for ordering within campaign
  historical_date text, -- specific date if known
  location text, -- specific location for this milestone
  participants text[], -- key historical figures involved
  outcome text, -- result/significance of this milestone
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT milestones_pkey PRIMARY KEY (id),
  CONSTRAINT milestones_campaign_slug_unique UNIQUE (campaign_id, slug)
);

-- User Progress for Campaigns (separate from game progress)
CREATE TABLE public.user_campaign_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  milestone_id uuid NOT NULL REFERENCES public.milestones(id),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  completion_time integer, -- time taken to complete this milestone in seconds
  score integer DEFAULT 0,
  notes text, -- user notes or achievements
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_campaign_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_campaign_progress_unique UNIQUE (user_id, milestone_id)
);

-- Indexes for better performance
CREATE INDEX idx_campaigns_category ON public.campaigns(category);
CREATE INDEX idx_campaigns_active ON public.campaigns(is_active);
CREATE INDEX idx_campaigns_featured ON public.campaigns(featured);
CREATE INDEX idx_campaigns_order ON public.campaigns(display_order);
CREATE INDEX idx_campaigns_slug ON public.campaigns(slug);

CREATE INDEX idx_milestones_campaign ON public.milestones(campaign_id);
CREATE INDEX idx_milestones_active ON public.milestones(is_active);
CREATE INDEX idx_milestones_order ON public.milestones(campaign_id, display_order);

CREATE INDEX idx_user_campaign_progress_user ON public.user_campaign_progress(user_id);
CREATE INDEX idx_user_campaign_progress_campaign ON public.user_campaign_progress(campaign_id);
CREATE INDEX idx_user_campaign_progress_milestone ON public.user_campaign_progress(milestone_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_campaign_progress ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Anyone can read active campaigns" ON public.campaigns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users WHERE is_active = true
    )
  );

-- Milestones policies
CREATE POLICY "Anyone can read active milestones" ON public.milestones
  FOR SELECT USING (
    is_active = true AND 
    campaign_id IN (SELECT id FROM public.campaigns WHERE is_active = true)
  );

CREATE POLICY "Admins can manage milestones" ON public.milestones
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users WHERE is_active = true
    )
  );

-- User progress policies
CREATE POLICY "Users can read own progress" ON public.user_campaign_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_campaign_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_campaign_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can read all progress
CREATE POLICY "Admins can read all progress" ON public.user_campaign_progress
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_users WHERE is_active = true
    )
  );
