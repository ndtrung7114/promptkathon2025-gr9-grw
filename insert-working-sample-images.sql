-- Insert sample game images with working URLs for testing
-- This uses the actual milestone ID that we know from the conversation: 082b7dac-2f81-4d6b-8a84-05c75be42f4e

-- First, clear any existing test data with example.com URLs
DELETE FROM public.game_images WHERE image_url LIKE '%example.com%';

-- Insert sample images for the specific milestone ID we're testing with
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
-- Images for milestone ID: 082b7dac-2f81-4d6b-8a84-05c75be42f4e
(
  'Hai Bà Trưng khởi nghĩa tại Hát Môn',
  'Trưng Trắc và Trưng Nhị tập hợp nhân dân Việt chống lại sự áp bức của quân Hán.',
  'history',
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/200/150?random=1',
  ARRAY[2, 3, 4],
  'Hát Môn, Mê Linh',
  '40-43 AD',
  'First major rebellion against Chinese domination led by female leaders',
  ARRAY['trung-sisters', 'rebellion', 'vietnamese-history', 'female-leaders'],
  true,
  '082b7dac-2f81-4d6b-8a84-05c75be42f4e',
  '/public/assets/audio/trung-sisters-1-call-to-arms.mp3'
),
(
  'Cờ hiệu khởi nghĩa của Hai Bà Trưng',
  'Lá cờ được giương cao như biểu tượng của cuộc khởi nghĩa chống Hán.',
  'history',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/200/150?random=2',
  ARRAY[2, 3, 4],
  'Mê Linh',
  '40 AD',
  'Symbol of Vietnamese resistance against foreign occupation',
  ARRAY['trung-sisters', 'flag', 'symbol', 'independence'],
  true,
  '082b7dac-2f81-4d6b-8a84-05c75be42f4e',
  '/public/assets/audio/trung-sisters-1-call-to-arms.mp3'
),
(
  'Dân chúng tập hợp theo Hai Bà Trưng',
  'Nhân dân từ khắp nơi đến ủng hộ cuộc khởi nghĩa của Hai Bà Trưng.',
  'history',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/200/150?random=3',
  ARRAY[2, 3, 4],
  'Mê Linh, Hát Môn',
  '40 AD',
  'Popular uprising against Chinese occupation',
  ARRAY['trung-sisters', 'people', 'uprising', 'resistance'],
  true,
  '082b7dac-2f81-4d6b-8a84-05c75be42f4e',
  '/public/assets/audio/trung-sisters-1-call-to-arms.mp3'
);

-- Verify the insertion
SELECT 
  gi.title,
  gi.image_url,
  gi.milestone_id,
  m.title as milestone_title
FROM public.game_images gi
LEFT JOIN public.milestones m ON gi.milestone_id = m.id
WHERE gi.milestone_id = '082b7dac-2f81-4d6b-8a84-05c75be42f4e'
AND gi.image_url LIKE 'https://picsum.photos%'
ORDER BY gi.created_at;
