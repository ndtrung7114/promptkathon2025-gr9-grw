-- Storage Setup for Image Uploads
-- Run this after the main migration script

-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images', 
  'game-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for game images bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'game-images' 
        AND name = 'Anyone can view game images'
    ) THEN
        CREATE POLICY "Anyone can view game images" ON storage.objects
        FOR SELECT USING (bucket_id = 'game-images');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'game-images' 
        AND name = 'Authenticated users can upload game images'
    ) THEN
        CREATE POLICY "Authenticated users can upload game images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'game-images' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'game-images' 
        AND name = 'Users can update their own images'
    ) THEN
        CREATE POLICY "Users can update their own images" ON storage.objects
        FOR UPDATE USING (bucket_id = 'game-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE bucket_id = 'game-images' 
        AND name = 'Users can delete their own images'
    ) THEN
        CREATE POLICY "Users can delete their own images" ON storage.objects
        FOR DELETE USING (bucket_id = 'game-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;
