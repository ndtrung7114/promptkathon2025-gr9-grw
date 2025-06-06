-- Insert existing historical campaigns data
-- This script populates the campaigns and milestones tables with the current static data

-- Insert campaigns
INSERT INTO public.campaigns (slug, title, period, description, image_url, display_order, category, historical_significance, is_active, featured) VALUES
('trung-sisters', 'Trưng Sisters'' Uprising', '40-43 AD', 'The first major rebellion against Chinese domination, led by the legendary Trưng sisters.', '/placeholder.svg', 1, 'history', 'First major Vietnamese independence movement against Chinese rule, establishing the precedent for later resistance movements.', true, true),
('bach-dang', 'Ngô Quyền''s Victory at Bạch Đằng', '938 AD', 'The decisive naval battle that ended Chinese domination and established Vietnamese independence.', '/placeholder.svg', 2, 'history', 'Decisive victory that ended nearly 1000 years of Chinese domination and established the first independent Vietnamese state.', true, true),
('mongol-invasions', 'Trần Dynasty & Mongol Invasions', '1225-1400 AD', 'Three heroic defenses against the mighty Mongol Empire under the Trần dynasty.', '/placeholder.svg', 3, 'history', 'Successfully defended against the Mongol Empire, one of the few nations to defeat Mongol invasions multiple times.', true, true),
('lam-son', 'Lam Sơn Uprising', '1418-1428 AD', 'Lê Lợi leads a peasant rebellion to expel Chinese Ming occupation.', '/placeholder.svg', 4, 'history', 'Successful peasant rebellion that expelled Chinese Ming occupation and established the Lê dynasty.', true, true);

-- Insert milestones for Trưng Sisters campaign
INSERT INTO public.milestones (campaign_id, slug, title, description, image_url, display_order, historical_date, participants, outcome) VALUES
((SELECT id FROM public.campaigns WHERE slug = 'trung-sisters'), 'call-to-arms', 'The Call to Arms', 'Trưng Trắc and Trưng Nhị rally the Vietnamese people against Chinese oppression.', '/placeholder.svg', 1, '40 AD', ARRAY['Trưng Trắc', 'Trưng Nhị'], 'Successful mobilization of Vietnamese forces'),
((SELECT id FROM public.campaigns WHERE slug = 'trung-sisters'), 'victory-me-linh', 'Victory at Mê Linh', 'The sisters lead their forces to victory, establishing an independent kingdom.', '/placeholder.svg', 2, '40 AD', ARRAY['Trưng Trắc', 'Trưng Nhị'], 'Establishment of independent Vietnamese kingdom'),
((SELECT id FROM public.campaigns WHERE slug = 'trung-sisters'), 'final-stand', 'The Final Stand', 'The heroic last battle and sacrifice of the Trưng sisters for Vietnamese independence.', '/placeholder.svg', 3, '43 AD', ARRAY['Trưng Trắc', 'Trưng Nhị'], 'Martyrdom became symbol of Vietnamese resistance');

-- Insert milestones for Bạch Đằng campaign
INSERT INTO public.milestones (campaign_id, slug, title, description, image_url, display_order, historical_date, participants, outcome) VALUES
((SELECT id FROM public.campaigns WHERE slug = 'bach-dang'), 'southern-han-invasion', 'The Southern Han Invasion', 'Chinese forces launch a massive naval invasion through the Bạch Đằng River.', '/placeholder.svg', 1, '938 AD', ARRAY['Southern Han forces'], 'Chinese naval invasion begins'),
((SELECT id FROM public.campaigns WHERE slug = 'bach-dang'), 'clever-trap', 'The Clever Trap', 'Ngô Quyền strategically places iron-tipped stakes beneath the river surface.', '/placeholder.svg', 2, '938 AD', ARRAY['Ngô Quyền'], 'Strategic trap preparation completed'),
((SELECT id FROM public.campaigns WHERE slug = 'bach-dang'), 'victory-independence', 'Victory and Independence', 'The Chinese fleet is destroyed, securing Vietnamese independence for centuries.', '/placeholder.svg', 3, '938 AD', ARRAY['Ngô Quyền'], 'Vietnamese independence secured');

-- Insert milestones for Mongol Invasions campaign
INSERT INTO public.milestones (campaign_id, slug, title, description, image_url, display_order, historical_date, participants, outcome) VALUES
((SELECT id FROM public.campaigns WHERE slug = 'mongol-invasions'), 'first-invasion', 'First Mongol Invasion', 'Trần Thủ Độ leads the defense against the first Mongol assault in 1258.', '/placeholder.svg', 1, '1258 AD', ARRAY['Trần Thủ Độ'], 'First Mongol invasion repelled'),
((SELECT id FROM public.campaigns WHERE slug = 'mongol-invasions'), 'second-invasion', 'Second Mongol Invasion', 'Trần Hưng Đạo defeats a larger Mongol force in 1285.', '/placeholder.svg', 2, '1285 AD', ARRAY['Trần Hưng Đạo'], 'Second Mongol invasion defeated'),
((SELECT id FROM public.campaigns WHERE slug = 'mongol-invasions'), 'third-victory', 'Third Victory at Bạch Đằng', 'The final defeat of Mongol naval forces using the famous stake trap strategy.', '/placeholder.svg', 3, '1288 AD', ARRAY['Trần Hưng Đạo'], 'Final Mongol defeat at Bạch Đằng');

-- Insert milestones for Lam Sơn campaign
INSERT INTO public.milestones (campaign_id, slug, title, description, image_url, display_order, historical_date, participants, outcome) VALUES
((SELECT id FROM public.campaigns WHERE slug = 'lam-son'), 'uprising-begins', 'The Uprising Begins', 'Lê Lợi starts the rebellion from his home base in Lam Sơn.', '/placeholder.svg', 1, '1418 AD', ARRAY['Lê Lợi'], 'Rebellion initiated from Lam Sơn'),
((SELECT id FROM public.campaigns WHERE slug = 'lam-son'), 'guerrilla-warfare', 'Guerrilla Warfare', 'Vietnamese forces use innovative guerrilla tactics against Ming armies.', '/placeholder.svg', 2, '1418-1427 AD', ARRAY['Lê Lợi', 'Nguyễn Trãi'], 'Successful guerrilla campaign'),
((SELECT id FROM public.campaigns WHERE slug = 'lam-son'), 'victory-le-dynasty', 'Victory and the Lê Dynasty', 'Final expulsion of Chinese forces and establishment of the Lê dynasty.', '/placeholder.svg', 3, '1428 AD', ARRAY['Lê Lợi'], 'Lê dynasty established, Chinese expelled');
