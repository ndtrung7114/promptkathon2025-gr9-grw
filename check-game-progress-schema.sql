-- Query to check the structure of the game_progress table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;
