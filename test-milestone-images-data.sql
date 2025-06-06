-- Insert sample game images linked to milestones for testing
-- This script adds test images to the game_images table with milestone_id references

-- First, let's get the milestone IDs from the milestones table
-- We'll use the milestone slugs that match the frontend campaign data

-- Sample images for Trung Sisters milestones
INSERT INTO public.game_images (
  title,
  description,
  topic,
  image_url,
  thumbnail_url,
  difficulty_levels,
  location,
  historical_period,
  cultural_significance,
  tags,
  is_active,
  milestone_id,
  audio_url
) VALUES 
-- Images for trung-sisters-1 milestone
(
  'Hai Bà Trưng khởi nghĩa tại Hát Môn',
  'Trưng Trắc và Trưng Nhị tập hợp nhân dân Việt chống lại sự áp bức của quân Hán.',
  'history',
  'https://example.com/trung-sisters-1-rally.jpg',
  'https://example.com/trung-sisters-1-rally-thumb.jpg',
  ARRAY[2, 3, 4],
  'Hát Môn, Mê Linh',
  '40-43 AD',
  'First major rebellion against Chinese domination led by female leaders',
  ARRAY['trung-sisters', 'rebellion', 'vietnamese-history', 'female-leaders'],
  true,
  (SELECT id FROM public.milestones WHERE slug = 'trung-sisters-1' LIMIT 1),
  'https://example.com/audio/trung-sisters-1-call-to-arms.mp3'
),
(
  'Cờ hiệu khởi nghĩa của Hai Bà Trưng',
  'Lá cờ được giương cao như biểu tượng của cuộc khởi nghĩa chống Hán.',
  'history',
  'https://example.com/trung-sisters-flag.jpg',
  'https://example.com/trung-sisters-flag-thumb.jpg',
  ARRAY[2, 3, 4],
  'Mê Linh',
  '40 AD',
  'Symbol of Vietnamese resistance against foreign occupation',
  ARRAY['trung-sisters', 'flag', 'symbol', 'independence'],
  true,
  (SELECT id FROM public.milestones WHERE slug = 'trung-sisters-1' LIMIT 1),
  'https://example.com/audio/trung-sisters-1-call-to-arms.mp3'
),

-- Images for trung-sisters-2 milestone
(
  'Chiến thắng tại Mê Linh',
  'Hai Bà Trưng lập được vương quốc độc lập sau chiến thắng quyết định.',
  'history',
  'https://example.com/trung-sisters-victory.jpg',
  'https://example.com/trung-sisters-victory-thumb.jpg',
  ARRAY[2, 3, 4],
  'Mê Linh',
  '40-41 AD',
  'Establishment of the first independent Vietnamese kingdom after Chinese occupation',
  ARRAY['trung-sisters', 'victory', 'independence', 'kingdom'],
  true,
  (SELECT id FROM public.milestones WHERE slug = 'trung-sisters-2' LIMIT 1),
  'https://example.com/audio/trung-sisters-2-victory-me-linh.mp3'
),

-- Images for bach-dang-1 milestone
(
  'Hạm đội Hán xâm lược sông Bạch Đằng',
  'Quân Hán Nam đưa hạm đội khổng lồ xâm lược qua sông Bạch Đằng.',
  'history',
  'https://example.com/bach-dang-invasion.jpg',
  'https://example.com/bach-dang-invasion-thumb.jpg',
  ARRAY[2, 3, 4],
  'Sông Bạch Đằng',
  '938 AD',
  'Chinese naval invasion attempt that led to Vietnamese independence',
  ARRAY['bach-dang', 'chinese-invasion', 'naval-battle'],
  true,
  (SELECT id FROM public.milestones WHERE slug = 'bach-dang-1' LIMIT 1),
  'https://example.com/audio/bach-dang-1-han-invasion.mp3'
),

-- Images for bach-dang-2 milestone
(
  'Ngô Quyền cắm cọc sắt dưới sông',
  'Chiến thuật thiên tài của Ngô Quyền với những cọc sắt nhọn cắm dưới lòng sông.',
  'history',
  'https://example.com/bach-dang-stakes.jpg',
  'https://example.com/bach-dang-stakes-thumb.jpg',
  ARRAY[2, 3, 4],
  'Sông Bạch Đằng',
  '938 AD',
  'Ingenious military strategy using iron-tipped stakes underwater',
  ARRAY['bach-dang', 'strategy', 'ngo-quyen', 'stakes'],
  true,
  (SELECT id FROM public.milestones WHERE slug = 'bach-dang-2' LIMIT 1),
  'https://example.com/audio/bach-dang-2-clever-trap.mp3'
);

-- Note: This script assumes:
-- 1. The milestones table exists with slug column
-- 2. The milestone slugs match the frontend campaign data
-- 3. You'll replace the example.com URLs with actual image URLs
-- 4. The audio URLs point to actual audio files

-- To verify the insertion worked, run:
-- SELECT gi.title, gi.topic, m.slug as milestone_slug, m.title as milestone_title
-- FROM public.game_images gi
-- LEFT JOIN public.milestones m ON gi.milestone_id = m.id
-- WHERE gi.milestone_id IS NOT NULL
-- ORDER BY m.slug, gi.created_at;
