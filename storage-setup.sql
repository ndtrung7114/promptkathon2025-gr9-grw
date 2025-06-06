-- Storage Setup Script
-- Run this AFTER the migration script completes successfully

-- Step 1: Create storage bucket (this might already exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access for game images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload game images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Step 3: Create storage policies
CREATE POLICY "Public read access for game images" ON storage.objects
FOR SELECT USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'game-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'game-images' AND auth.uid() = owner);

-- Success message
SELECT 'Storage setup completed successfully! ✅' as status;
