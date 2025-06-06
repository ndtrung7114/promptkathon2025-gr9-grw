-- Add isPremium column to profiles table
-- This migration adds premium functionality to the existing profiles table

-- Step 1: Add isPremium column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Step 2: Create an index for faster queries on premium status
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- Step 3: Update the handle_new_user function to include isPremium
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_premium)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Optionally set some test users as premium (for testing purposes)
-- You can uncomment and modify these lines to set specific users as premium
-- UPDATE public.profiles SET is_premium = true WHERE email = 'test@example.com';
-- UPDATE public.profiles SET is_premium = true WHERE email = 'premium@example.com';

-- Step 5: Add RLS policy for premium status (users can read their own premium status)
-- This is already covered by existing "Users can view their own profile" policy
-- No additional policy needed since premium status is part of the profile

-- Verification query (optional - you can run this to check the changes)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public' 
-- ORDER BY ordinal_position;
