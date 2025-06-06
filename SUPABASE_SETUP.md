# Supabase Database Setup Guide

## Prerequisites

- Supabase account and project created
- Environment variables configured in `.env.local`

## Step 1: Database Schema Setup

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Create a new query and paste the contents of `database-schema.sql`
4. Run the SQL script to create all tables, functions, and policies

## Step 2: Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `game-images`
3. Set the bucket to be public:

   ```sql
   UPDATE storage.buckets
   SET public = true
   WHERE id = 'game-images';
   ```

4. Create storage policies:

   ```sql
   -- Allow public read access to game images
   CREATE POLICY "Public read access to game images" ON storage.objects
   FOR SELECT USING (bucket_id = 'game-images');

   -- Allow authenticated users to upload images (for admin)
   CREATE POLICY "Authenticated users can upload images" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'game-images' AND
     auth.role() = 'authenticated'
   );

   -- Allow authenticated users to delete images (for admin)
   CREATE POLICY "Authenticated users can delete images" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'game-images' AND
     auth.role() = 'authenticated'
   );
   ```

## Step 3: Sample Data Setup

Run this SQL to add sample game images:

```sql
-- Insert sample history images
INSERT INTO public.game_images (title, description, topic, image_url, location, historical_period, tags) VALUES
('Hội An Ancient Town', 'Historic trading port with well-preserved architecture', 'history', 'history/hoi-an.jpg', 'Hội An, Quảng Nam', '15th-19th century', ARRAY['unesco', 'ancient town', 'architecture']),
('Imperial City of Huế', 'Former imperial capital of Vietnam', 'history', 'history/hue-imperial.jpg', 'Huế, Thừa Thiên Huế', '1802-1945', ARRAY['imperial', 'citadel', 'unesco']),
('Temple of Literature', 'First university of Vietnam', 'history', 'history/temple-literature.jpg', 'Hanoi', '1070', ARRAY['education', 'confucian', 'temple']),
('Củ Chi Tunnels', 'Underground tunnel network from Vietnam War', 'history', 'history/cu-chi-tunnels.jpg', 'Củ Chi, Ho Chi Minh City', '1940s-1970s', ARRAY['war', 'tunnels', 'resistance']);

-- Insert sample culture images
INSERT INTO public.game_images (title, description, topic, image_url, cultural_significance, tags) VALUES
('Áo Dài Fashion', 'Traditional Vietnamese dress', 'culture', 'culture/ao-dai.jpg', 'Symbol of Vietnamese elegance and grace', ARRAY['fashion', 'traditional dress', 'silk']),
('Water Puppetry', 'Traditional water puppet performance', 'culture', 'culture/water-puppets.jpg', 'Ancient art form depicting rural life and legends', ARRAY['performing arts', 'puppetry', 'water']),
('Bánh Chưng', 'Traditional sticky rice cake for Tết', 'culture', 'culture/banh-chung.jpg', 'Symbol of Earth and gratitude to ancestors', ARRAY['food', 'tet', 'traditional']),
('Dragon Dance', 'Ceremonial dragon dance performance', 'culture', 'culture/dragon-dance.jpg', 'Brings good luck and prosperity', ARRAY['festival', 'dance', 'dragon']);
```

## Step 4: Environment Variables

Ensure your `.env.local` file has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5: Test Database Connection

1. Start your development server: `npm run dev`
2. Open the browser console
3. Try logging in - user profiles should be created automatically
4. Check the Supabase dashboard to see if data is being created

## Troubleshooting

### Common Issues:

1. **RLS Policies**: If you can't read/write data, check Row Level Security policies
2. **Storage Access**: Ensure storage bucket is public and policies are set correctly
3. **Image URLs**: Make sure image URLs point to actual image files in your storage bucket
4. **Authentication**: Verify that user authentication is working before testing game features

### Debugging Queries:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check sample data
SELECT * FROM public.game_images LIMIT 5;

-- Check user profiles
SELECT * FROM public.user_profiles;

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## Next Steps

After setting up the database:

1. Upload actual game images to the storage bucket
2. Update image URLs in the game_images table
3. Test the complete game flow
4. Set up admin interface for managing images
5. Implement achievement notifications
6. Add user statistics dashboard
