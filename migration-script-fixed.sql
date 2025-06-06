-- FIXED Migration Script for Existing Supabase Database
-- This version handles existing policies and won't error if things already exist

-- Step 1: Modify existing profiles table to match our user_profiles structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_topic TEXT CHECK (favorite_topic IN ('history', 'culture')),
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Step 2: Create game_images table (new)
CREATE TABLE IF NOT EXISTS public.game_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL CHECK (topic IN ('history', 'culture')),
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    difficulty_levels INTEGER[] DEFAULT '{2,3,4}',
    location TEXT,
    historical_period TEXT,
    cultural_significance TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Step 3: Modify existing game_progress table to match our game_sessions structure
ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS image_id UUID REFERENCES public.game_images(id),
ADD COLUMN IF NOT EXISTS topic TEXT CHECK (topic IN ('history', 'culture')),
ADD COLUMN IF NOT EXISTS difficulty INTEGER CHECK (difficulty IN (2, 3, 4)),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_time INTEGER,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS moves_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0;

-- Step 4: Create user_best_times table (new)
CREATE TABLE IF NOT EXISTS public.user_best_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    image_id UUID REFERENCES public.game_images(id) NOT NULL,
    topic TEXT NOT NULL CHECK (topic IN ('history', 'culture')),
    difficulty INTEGER NOT NULL CHECK (difficulty IN (2, 3, 4)),
    best_time INTEGER NOT NULL,
    best_moves INTEGER,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID REFERENCES public.game_progress(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id, topic, difficulty)
);

-- Step 5: Create campaign_progress table (new)
CREATE TABLE IF NOT EXISTS public.campaign_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    campaign_id TEXT NOT NULL,
    milestone_id TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    difficulty INTEGER CHECK (difficulty IN (2, 3, 4)),
    completion_time INTEGER,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, campaign_id, milestone_id, difficulty)
);

-- Step 6: Create user_achievements table (new)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID REFERENCES public.game_progress(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Enable Row Level Security (only if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_best_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies first, then recreate them
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Game progress policies
DROP POLICY IF EXISTS "Users can view their own game progress" ON public.game_progress;
DROP POLICY IF EXISTS "Users can insert their own game progress" ON public.game_progress;
DROP POLICY IF EXISTS "Users can update their own game progress" ON public.game_progress;

CREATE POLICY "Users can view their own game progress" ON public.game_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game progress" ON public.game_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game progress" ON public.game_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Game images policies (public read, authenticated write)
DROP POLICY IF EXISTS "Anyone can view active game images" ON public.game_images;
DROP POLICY IF EXISTS "Authenticated users can insert game images" ON public.game_images;
DROP POLICY IF EXISTS "Users can update their own game images" ON public.game_images;
DROP POLICY IF EXISTS "Users can delete their own game images" ON public.game_images;

CREATE POLICY "Anyone can view active game images" ON public.game_images
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can insert game images" ON public.game_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own game images" ON public.game_images
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own game images" ON public.game_images
    FOR DELETE USING (auth.uid() = created_by);

-- User best times policies
DROP POLICY IF EXISTS "Users can view their own best times" ON public.user_best_times;
DROP POLICY IF EXISTS "Users can insert their own best times" ON public.user_best_times;
DROP POLICY IF EXISTS "Users can update their own best times" ON public.user_best_times;

CREATE POLICY "Users can view their own best times" ON public.user_best_times
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own best times" ON public.user_best_times
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own best times" ON public.user_best_times
    FOR UPDATE USING (auth.uid() = user_id);

-- Campaign progress policies
DROP POLICY IF EXISTS "Users can view their own campaign progress" ON public.campaign_progress;
DROP POLICY IF EXISTS "Users can insert their own campaign progress" ON public.campaign_progress;
DROP POLICY IF EXISTS "Users can update their own campaign progress" ON public.campaign_progress;

CREATE POLICY "Users can view their own campaign progress" ON public.campaign_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaign progress" ON public.campaign_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign progress" ON public.campaign_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 9: Create or replace functions for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 10: Create or replace function to update best times automatically
CREATE OR REPLACE FUNCTION public.update_best_time() 
RETURNS trigger AS $$
BEGIN
  -- Only process completed games
  IF NEW.is_completed = true AND NEW.completion_time IS NOT NULL AND NEW.image_id IS NOT NULL THEN
    INSERT INTO public.user_best_times (user_id, image_id, topic, difficulty, best_time, best_moves, session_id)
    VALUES (NEW.user_id, NEW.image_id, NEW.topic, NEW.difficulty, NEW.completion_time, NEW.moves_count, NEW.id)
    ON CONFLICT (user_id, image_id, topic, difficulty)
    DO UPDATE SET
      best_time = LEAST(user_best_times.best_time, NEW.completion_time),
      best_moves = CASE 
        WHEN NEW.completion_time < user_best_times.best_time THEN NEW.moves_count
        WHEN NEW.completion_time = user_best_times.best_time THEN LEAST(user_best_times.best_moves, NEW.moves_count)
        ELSE user_best_times.best_moves
      END,
      achieved_at = CASE 
        WHEN NEW.completion_time < user_best_times.best_time THEN NOW()
        ELSE user_best_times.achieved_at
      END,
      session_id = CASE 
        WHEN NEW.completion_time < user_best_times.best_time THEN NEW.id
        ELSE user_best_times.session_id
      END,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic best time updates
DROP TRIGGER IF EXISTS on_game_completed ON public.game_progress;
CREATE TRIGGER on_game_completed
  AFTER INSERT OR UPDATE ON public.game_progress
  FOR EACH ROW EXECUTE PROCEDURE public.update_best_time();

-- Step 11: Add sample game images (using INSERT ... ON CONFLICT DO NOTHING)
INSERT INTO public.game_images (title, description, topic, image_url, location, historical_period, tags) VALUES
('Hội An Ancient Town', 'Historic trading port with well-preserved architecture', 'history', 'history/hoi-an.jpg', 'Hội An, Quảng Nam', '15th-19th century', ARRAY['unesco', 'ancient town', 'architecture']),
('Imperial City of Huế', 'Former imperial capital of Vietnam', 'history', 'history/hue-imperial.jpg', 'Huế, Thừa Thiên Huế', '1802-1945', ARRAY['imperial', 'citadel', 'unesco']),
('Temple of Literature', 'First university of Vietnam', 'history', 'history/temple-literature.jpg', 'Hanoi', '1070', ARRAY['education', 'confucian', 'temple']),
('Củ Chi Tunnels', 'Underground tunnel network from Vietnam War', 'history', 'history/cu-chi-tunnels.jpg', 'Củ Chi, Ho Chi Minh City', '1940s-1970s', ARRAY['war', 'tunnels', 'resistance'])
ON CONFLICT (title) DO NOTHING;

INSERT INTO public.game_images (title, description, topic, image_url, cultural_significance, tags) VALUES
('Áo Dài Fashion', 'Traditional Vietnamese dress', 'culture', 'culture/ao-dai.jpg', 'Symbol of Vietnamese elegance and grace', ARRAY['fashion', 'traditional dress', 'silk']),
('Water Puppetry', 'Traditional water puppet performance', 'culture', 'culture/water-puppets.jpg', 'Ancient art form depicting rural life and legends', ARRAY['performing arts', 'puppetry', 'water']),
('Bánh Chưng', 'Traditional sticky rice cake for Tết', 'culture', 'culture/banh-chung.jpg', 'Symbol of Earth and gratitude to ancestors', ARRAY['food', 'tet', 'traditional']),
('Dragon Dance', 'Ceremonial dragon dance performance', 'culture', 'culture/dragon-dance.jpg', 'Brings good luck and prosperity', ARRAY['festival', 'dance', 'dragon'])
ON CONFLICT (title) DO NOTHING;

-- Success message
SELECT 'Migration completed successfully! ✅' as status;
