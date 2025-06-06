-- Test milestone images with proper milestone_id filtering
-- This script ensures all images have valid milestone_id values

-- First, let's check existing data
SELECT 
    id, 
    title, 
    milestone_id, 
    topic,
    is_active,
    CASE 
        WHEN milestone_id IS NULL THEN 'NO_MILESTONE'
        WHEN milestone_id = '' THEN 'EMPTY_MILESTONE'
        ELSE 'HAS_MILESTONE'
    END as milestone_status
FROM game_images
ORDER BY milestone_status, topic;

-- Update any empty string milestone_ids to NULL for consistency
UPDATE game_images 
SET milestone_id = NULL 
WHERE milestone_id = '';

-- Insert sample images with proper milestone_id values
-- These will be fetched by the updated service

-- Sample history images linked to specific milestones
INSERT INTO game_images (
    id, title, description, topic, image_url, thumbnail_url, 
    difficulty_levels, milestone_id, is_active, tags, 
    historical_period, cultural_significance
) VALUES 
-- Trung Sisters Campaign Images
(
    'trung-sisters-img-1',
    'Hai Bà Trưng Khởi Nghĩa',
    'Trưng Trắc và Trưng Nhị phất cờ khởi nghĩa chống lại quân Hán',
    'history',
    '/assets/images/trung-sisters-uprising.jpg',
    '/assets/images/thumbnails/trung-sisters-uprising-thumb.jpg',
    ARRAY[3, 4, 5],
    'trung-sisters-uprising',
    true,
    ARRAY['trung-sisters', 'uprising', 'han-dynasty', 'resistance'],
    '40-43 AD',
    'Biểu tượng tinh thần chống ngoại xâm của dân tộc Việt Nam'
),
(
    'trung-sisters-img-2', 
    'Trưng Trắc Tự Xưng Là Vua',
    'Trưng Trắc lên ngôi vua, thiết lập chính quyền độc lập',
    'history',
    '/assets/images/trung-trac-queen.jpg',
    '/assets/images/thumbnails/trung-trac-queen-thumb.jpg', 
    ARRAY[3, 4, 5],
    'trung-trac-queen',
    true,
    ARRAY['trung-trac', 'queen', 'independence', 'leadership'],
    '40-43 AD',
    'Người phụ nữ đầu tiên trong lịch sử Việt Nam lên ngôi vua'
),
(
    'trung-sisters-img-3',
    'Trận Chiến Cuối Cùng',
    'Cuộc chiến cuối cùng của Hai Bà Trưng với quân Hán',
    'history', 
    '/assets/images/trung-sisters-final-battle.jpg',
    '/assets/images/thumbnails/trung-sisters-final-battle-thumb.jpg',
    ARRAY[4, 5, 6],
    'trung-sisters-final-battle',
    true,
    ARRAY['trung-sisters', 'battle', 'sacrifice', 'han-defeat'],
    '43 AD',
    'Tinh thần hy sinh vì tổ quốc của các nữ anh hùng'
),

-- Ly Dynasty Images  
(
    'ly-dynasty-img-1',
    'Lý Thái Tổ Dời Đô',
    'Lý Thái Tổ dời đô về Thăng Long năm 1010',
    'history',
    '/assets/images/ly-thai-to-capital.jpg', 
    '/assets/images/thumbnails/ly-thai-to-capital-thumb.jpg',
    ARRAY[3, 4, 5],
    'ly-thai-to-capital',
    true,
    ARRAY['ly-dynasty', 'capital', 'thang-long', 'founding'],
    '1009-1028',
    'Việc dời đô đánh dấu sự phát triển mạnh mẽ của nhà Lý'
),

-- Culture images with milestone links
(
    'tet-culture-img-1',
    'Tết Nguyên Đán Truyền Thống',
    'Không khí Tết cổ truyền với bánh chưng, cây nêu',
    'culture',
    '/assets/images/tet-traditional.jpg',
    '/assets/images/thumbnails/tet-traditional-thumb.jpg',
    ARRAY[3, 4, 5], 
    'tet-traditions',
    true,
    ARRAY['tet', 'new-year', 'banh-chung', 'traditions'],
    'Traditional',
    'Lễ hội quan trọng nhất trong năm của người Việt Nam'
);

-- Verify the inserted data
SELECT 
    id,
    title, 
    milestone_id,
    topic,
    is_active,
    array_length(difficulty_levels, 1) as num_difficulties
FROM game_images 
WHERE milestone_id IS NOT NULL
ORDER BY topic, milestone_id;

-- Test query to see what the service will fetch
SELECT 
    COUNT(*) as total_milestone_images,
    topic,
    COUNT(*) FILTER (WHERE milestone_id IS NOT NULL) as with_milestone,
    COUNT(*) FILTER (WHERE milestone_id IS NULL) as without_milestone
FROM game_images 
WHERE is_active = true
GROUP BY topic;
