-- Sample Campaign Data for Vietnam Heritage Jigsaw Quest
-- This script populates the campaigns and milestones tables with historical data

-- Insert Campaigns
INSERT INTO public.campaigns (
  slug, title, period, description, image_url, display_order, 
  category, location, historical_significance, is_active, featured
) VALUES 
(
  'trung-sisters',
  'Trưng Sisters'' Uprising',
  '40-43 AD',
  'The first major rebellion against Chinese domination, led by the legendary Trưng sisters.',
  '/placeholder.svg',
  1,
  'history',
  'Northern Vietnam',
  'The Trưng Sisters represent the earliest recorded resistance against foreign domination in Vietnamese history. Their uprising established the first independent Vietnamese state and became a symbol of Vietnamese resistance and women''s leadership.',
  true,
  true
),
(
  'ngo-quyen-bach-dang',
  'Ngô Quyền and the Battle of Bạch Đằng',
  '938 AD',
  'The decisive naval victory that ended Chinese domination and established Vietnamese independence.',
  '/placeholder.svg',
  2,
  'history',
  'Bạch Đằng River',
  'This victory marked the end of over 1000 years of Chinese rule and established the foundation for an independent Vietnamese nation.',
  true,
  false
),
(
  'lam-son-uprising',
  'Lam Sơn Uprising',
  '1418-1428',
  'Lê Lợi''s resistance movement that expelled the Ming Chinese and established the Lê dynasty.',
  '/placeholder.svg',
  3,
  'history',
  'Thanh Hóa Province',
  'The most successful resistance movement against Ming occupation, establishing Vietnam as a major power in Southeast Asia.',
  true,
  false
);

-- Insert Milestones for Trưng Sisters Campaign
INSERT INTO public.milestones (
  campaign_id, slug, title, description, image_url, display_order,
  historical_date, location, participants, outcome
) 
SELECT 
  c.id,
  'call-to-arms',
  'The Call to Arms',
  'Trưng Trắc and Trưng Nhị rally the Vietnamese people against Chinese oppression after the death of Trưng Trắc''s husband.',
  '/placeholder.svg',
  1,
  '40 AD',
  'Mê Linh',
  ARRAY['Trưng Trắc', 'Trưng Nhị', 'Tô Định'],
  'Successful mobilization of Vietnamese nobles and people for rebellion'
FROM public.campaigns c WHERE c.slug = 'trung-sisters'

UNION ALL

SELECT 
  c.id,
  'victory-me-linh',
  'Victory at Mê Linh',
  'The sisters lead their forces to victory, establishing an independent kingdom spanning most of modern Vietnam.',
  '/placeholder.svg',
  2,
  '41 AD',
  'Mê Linh and surrounding regions',
  ARRAY['Trưng Trắc', 'Trưng Nhị', 'Phùng Thị Chính'],
  'Establishment of independent Vietnamese kingdom, control over 65 citadels'
FROM public.campaigns c WHERE c.slug = 'trung-sisters'

UNION ALL

SELECT 
  c.id,
  'final-stand',
  'The Final Stand',
  'The heroic last battle and sacrifice of the Trưng sisters when Chinese reinforcements arrive under General Ma Yuan.',
  '/placeholder.svg',
  3,
  '43 AD',
  'Hát Môn',
  ARRAY['Trưng Trắc', 'Trưng Nhị', 'Ma Yuan'],
  'Heroic sacrifice, martyrdom that inspired future resistance movements'
FROM public.campaigns c WHERE c.slug = 'trung-sisters';

-- Insert Milestones for Ngô Quyền Campaign
INSERT INTO public.milestones (
  campaign_id, slug, title, description, image_url, display_order,
  historical_date, location, participants, outcome
)
SELECT 
  c.id,
  'southern-han-invasion',
  'Southern Han Invasion',
  'The Southern Han dynasty attempts to reassert Chinese control over Vietnam after the Khúc family rebellion.',
  '/placeholder.svg',
  1,
  '938 AD',
  'Northern Vietnam',
  ARRAY['Liu Hongcao', 'Ngô Quyền'],
  'Chinese forces advance toward Vietnamese territory'
FROM public.campaigns c WHERE c.slug = 'ngo-quyen-bach-dang'

UNION ALL

SELECT 
  c.id,
  'strategic-preparation',
  'Strategic Preparation',
  'Ngô Quyền prepares his naval forces and devises the famous iron stake trap strategy.',
  '/placeholder.svg',
  2,
  '938 AD',
  'Bạch Đằng River',
  ARRAY['Ngô Quyền', 'Vietnamese naval commanders'],
  'Innovative defensive strategy utilizing tidal movements and iron stakes'
FROM public.campaigns c WHERE c.slug = 'ngo-quyen-bach-dang'

UNION ALL

SELECT 
  c.id,
  'battle-bach-dang',
  'The Battle of Bạch Đằng',
  'The decisive naval battle where Vietnamese forces defeat the Southern Han fleet using innovative tactics.',
  '/placeholder.svg',
  3,
  'October 938 AD',
  'Bạch Đằng River',
  ARRAY['Ngô Quyền', 'Liu Hongcao', 'Southern Han Admiral'],
  'Complete victory, death of Liu Hongcao, end of Chinese domination'
FROM public.campaigns c WHERE c.slug = 'ngo-quyen-bach-dang';

-- Insert Milestones for Lam Sơn Uprising
INSERT INTO public.milestones (
  campaign_id, slug, title, description, image_url, display_order,
  historical_date, location, participants, outcome
)
SELECT 
  c.id,
  'ming-occupation',
  'Ming Occupation Begins',
  'The Ming dynasty occupies Vietnam, imposing harsh cultural assimilation policies and heavy taxation.',
  '/placeholder.svg',
  1,
  '1407-1418',
  'Throughout Vietnam',
  ARRAY['Ming administrators', 'Lê Lợi', 'Vietnamese nobles'],
  'Growing resentment and underground resistance movement formation'
FROM public.campaigns c WHERE c.slug = 'lam-son-uprising'

UNION ALL

SELECT 
  c.id,
  'guerrilla-warfare',
  'Guerrilla Warfare',
  'Vietnamese forces under Lê Lợi use innovative guerrilla tactics against Ming armies, gradually gaining territory.',
  '/placeholder.svg',
  2,
  '1418-1425',
  'Lam Sơn region',
  ARRAY['Lê Lợi', 'Nguyễn Trãi', 'Lê Sát'],
  'Successful guerrilla campaign, liberation of significant territory'
FROM public.campaigns c WHERE c.slug = 'lam-son-uprising'

UNION ALL

SELECT 
  c.id,
  'victory-le-dynasty',
  'Victory and the Lê Dynasty',
  'Final expulsion of Chinese forces and establishment of the Lê dynasty with Lê Lợi as emperor.',
  '/placeholder.svg',
  3,
  '1428',
  'Thăng Long (Hanoi)',
  ARRAY['Lê Lợi', 'Nguyễn Trãi', 'Ming generals'],
  'Complete independence, establishment of Lê dynasty, cultural renaissance'
FROM public.campaigns c WHERE c.slug = 'lam-son-uprising';

-- Update campaign statistics
UPDATE public.campaigns 
SET updated_at = NOW() 
WHERE slug IN ('trung-sisters', 'ngo-quyen-bach-dang', 'lam-son-uprising');

-- Verify the data insertion
SELECT 
  c.title as campaign_title,
  c.period,
  COUNT(m.id) as milestone_count
FROM public.campaigns c
LEFT JOIN public.milestones m ON c.id = m.campaign_id AND m.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.title, c.period, c.display_order
ORDER BY c.display_order;
