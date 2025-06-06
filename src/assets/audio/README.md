# Audio Files for Vietnam Heritage Jigsaw Quest

This folder contains audio narration files for the game's historical milestone stories.

## Milestone Audio File Mapping:

### Trưng Sisters Campaign (40-43 AD):

- `trung-sisters-1-call-to-arms.mp3` - Trưng Trắc and Trưng Nhị rally the Vietnamese people against Chinese oppression
- `trung-sisters-2-victory-me-linh.mp3` - The sisters lead their forces to victory, establishing an independent kingdom
- `trung-sisters-3-final-stand.mp3` - The heroic last battle and sacrifice of the Trưng sisters for independence

### Bạch Đằng Campaign (938 AD):

- `bach-dang-1-han-invasion.mp3` - Chinese forces launch a massive naval invasion through the Bạch Đằng River
- `bach-dang-2-clever-trap.mp3` - Ngô Quyền strategically places iron-tipped stakes beneath the river surface
- `bach-dang-3-victory-independence.mp3` - The Chinese fleet is destroyed, securing Vietnamese independence

### Mongol Invasions Campaign (1225-1400 AD):

- `mongol-1-first-invasion.mp3` - Trần Thủ Độ leads the defense against the first Mongol assault in 1258
- `mongol-2-second-invasion.mp3` - Trần Hưng Đạo defeats a larger Mongol force in 1285
- `mongol-3-third-victory.mp3` - The final defeat of Mongol naval forces using the famous stake trap strategy

### Lam Sơn Campaign (1418-1428 AD):

- `lam-son-1-uprising-begins.mp3` - Lê Lợi starts the rebellion from his home base in Lam Sơn
- `lam-son-2-guerrilla-warfare.mp3` - Vietnamese forces use innovative guerrilla tactics against Ming armies
- `lam-son-3-le-dynasty.mp3` - Final expulsion of Chinese forces and establishment of the Lê dynasty

## Audio Format Requirements:

- Format: MP3 or OGG
- Quality: 128kbps or higher
- Length: 30 seconds to 3 minutes recommended
- Language: Vietnamese (with optional English subtitles)

## How the System Works:

1. **File-based Assignment**: Simply upload audio files with the exact filenames listed above to this directory
2. **Automatic Detection**: The game automatically associates audio files with milestones based on filename matching
3. **No Database Required**: The system uses the predefined mapping in `campaigns.ts` - no database configuration needed

## Adding Audio Files:

1. Record or obtain audio narration for each milestone story
2. Name the file exactly as specified in the mapping above
3. Place the file in this `/src/assets/audio/` directory
4. The audio will automatically be available when players complete the corresponding milestone puzzle

## Example Audio Content:

Each audio file should contain engaging Vietnamese narration (1-3 minutes) telling the historical story of that specific milestone, including:

- Historical context and significance
- Key figures and their roles
- Cultural and social impact
- Legacy and importance to Vietnamese heritage
