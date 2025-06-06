import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation keys
const translations = {  vi: {
    // Cover Page
    'cover.title': '🧩 Vietnam Heritage Jigsaw Quest',
    'cover.subtitle': 'Khám phá di sản tuyệt đẹp của Việt Nam qua các câu đố tương tác',
    'cover.hero.title': 'Khám phá nền văn hóa phong phú của Việt Nam',
    'cover.hero.description': 'Đắm chìm vào di sản tuyệt đẹp của Việt Nam qua các câu đố ghép hình được chế tác tinh xảo. Từ những ngôi đền cổ kính đến những lễ hội sôi động, khám phá những câu chuyện đằng sau mỗi hình ảnh khi bạn giải quyết.',
    'cover.feature1': 'Địa danh lịch sử và đền thờ',
    'cover.feature2': 'Lễ hội và phong tục truyền thống',
    'cover.feature3': 'Phong cảnh ngoạn mục',
    'cover.feature4': 'Ẩm thực Việt Nam hấp dẫn',
    'cover.difficulty.title': 'Nhiều cấp độ khó',
    'cover.difficulty.description': 'Chọn từ lưới câu đố 2×2, 3×3 hoặc 4×4. Hoàn hảo cho người mới bắt đầu và bậc thầy câu đố.',
    'cover.campaigns.title': 'Chiến dịch lịch sử',
    'cover.campaigns.description': 'Mở khóa các chiến dịch lịch sử đặc biệt với câu đố cột mốc và nội dung giáo dục.',
    'cover.progress.title': 'Theo dõi tiến trình của bạn',
    'cover.progress.description': 'Lưu thời gian tốt nhất và cạnh tranh với bạn bè. Theo dõi sự cải thiện của bạn theo thời gian.',
    'cover.cta.title': 'Sẵn sàng bắt đầu hành trình của bạn?',
    'cover.cta.description': 'Đăng nhập bằng Google để lưu tiến trình và mở khóa tất cả tính năng',
    'cover.cta.button': 'Bắt đầu chơi với Google',
    'cover.cta.note': 'Miễn phí chơi • Không cần thẻ tín dụng • Truy cập ngay lập tức',
    'cover.footer': 'Trải nghiệm vẻ đẹp và lịch sử của Việt Nam qua các câu đố tương tác',

    // Home Screen
    'home.title': 'Mảnh Ghép Sử Việt',
    'home.subtitle': 'Cùng ghép, cùng chơi, cùng nhớ lịch sử văn hóa nước mình!',
    'home.welcome': 'Chào mừng quay trở lại, {name}! 🎉',
    'home.history.title': 'Lịch sử',
    'home.history.description': 'Khám phá các sự kiện lịch sử của Việt Nam theo từng cột mốc thông qua giải đố',
    'home.culture.title': 'Văn hóa',
    'home.culture.description': 'Đắm mình vào nghệ thuật truyền thống, lễ hội, ẩm thực và kho tàng văn hóa của Việt Nam',
    'home.bestTimes': 'Thời gian tốt nhất',
      // Difficulty Selection
    'difficulty.beginner': 'Người mới',
    'difficulty.intermediate': 'Trung cấp',
    'difficulty.advanced': 'Nâng cao',
    'difficulty.beginner.desc': 'Hoàn hảo cho một câu đố nhanh',
    'difficulty.intermediate.desc': 'Một thử thách cân bằng',
    'difficulty.advanced.desc': 'Dành cho bậc thầy câu đố',
    'difficulty.choose': 'Chọn kích thước câu đố của bạn: ít mảnh ghép hơn cho một giải quyết nhanh, nhiều mảnh ghép hơn cho một thử thách',
    'difficulty.pieces': 'mảnh ghép',
    
    // Puzzle Game
    'puzzle.preview': 'Xem trước',
    'puzzle.shuffle': 'Xáo trộn lại',
    'puzzle.time': 'Thời gian',
    'puzzle.moves': 'Số lần di chuyển',
    'puzzle.best': 'BEST',
    
    // Victory Modal    'victory.congratulations': 'Chúc mừng!',
    'victory.completed': 'Bạn đã hoàn thành thành công câu đố!',
    'victory.time': 'Thời gian',
    'victory.moves': 'Số lần di chuyển',
    'victory.completed.label': 'Hoàn thành',
    'victory.newRecord': '🏆 Kỉ lục mới!',
    'victory.imageInfo': 'Thông tin về bức tranh:',
    'victory.audioInfo': '🎵 Nghe kể chuyện về bức tranh di sản văn hóa Việt Nam này',
    'victory.replay': 'Chơi lại',
    'victory.back': 'Quay lại',
    'victory.home': 'Trang chủ',
      // Premium Features
    'premium.title': 'Tính năng Premium',
    'premium.subtitle': 'Nâng cấp để mở khóa tất cả tính năng',
    'premium.preview.locked': 'Xem trước bị khóa',
    'premium.preview.description': 'Tính năng "Xem trước" trong chế độ văn hóa chỉ dành cho tài khoản Premium',
    'premium.history.locked': 'Chiến dịch lịch sử bị khóa',
    'premium.history.description': 'Bạn cần tài khoản Premium để truy cập nội dung này',
    'premium.campaign.locked': 'Chiến dịch này yêu cầu Premium',
    'premium.campaign.description': 'Nâng cấp để mở khóa tất cả chiến dịch lịch sử',
    'premium.benefits': 'Lợi ích Premium:','premium.benefit1': 'Xem trước hình ảnh trong tất cả chế độ chơi',
    'premium.benefit2': 'Truy cập không giới hạn tất cả chiến dịch lịch sử',
    'premium.benefit3': 'Hỗ trợ phát triển game Việt Nam',
    'premium.close': 'Để sau',
    'premium.upgrade': 'Nâng cấp Premium',
      // Campaigns    'campaigns.loading': 'Đang tải chiến dịch lịch sử...',
    'campaigns.title': 'Các sự kiện lịch sử',
    'campaigns.subtitle': 'Hành trình qua lịch sử VIệt Nam huy hoàng',
    'campaigns.difficulty': 'Chọn độ khó:',
    'campaigns.unlock': 'Hoàn thành cột mốc trước để mở khóa',
    'campaigns.progress': '{completed}/{total} cột mốc hoàn thành',
    
    // Auth
    'auth.signIn': 'Đăng nhập',
    'auth.signUp': 'Đăng ký',
    'auth.signOut': 'Đăng xuất',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.name': 'Tên',
    'auth.googleSignInFailed': 'Không thể đăng nhập bằng Google',
    
    // Game
    'game.time': 'Thời gian',
    'game.moves': 'Số lần di chuyển',
    'game.best': 'TUYỆT NHẤT',
    'game.preview': 'Xem trước',
    'game.shuffle': 'Xáo trộn lại',
      // Background Music
    'music.backgroundMusic': 'Nhạc nền',
    'music.play': 'Phát',
    'music.pause': 'Tạm dừng',
    'music.loading': 'Đang tải...',
    'music.settings': 'Cài đặt âm nhạc',
    'music.turnOff': 'Tắt nhạc nền',
    'music.enable': 'Bật nhạc nền',
    'music.volume': 'Âm lượng',
    
    // Common
    'common.back': 'Quay lại',
    'common.close': 'Đóng',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
  },  en: {
    // Cover Page
    'cover.title': '🧩 Vietnam Heritage Jigsaw Quest',
    'cover.subtitle': 'Discover Vietnam\'s Beautiful Heritage Through Interactive Puzzles',
    'cover.hero.title': 'Explore Vietnam\'s Rich Culture',
    'cover.hero.description': 'Immerse yourself in Vietnam\'s stunning heritage through beautifully crafted jigsaw puzzles. From ancient temples to vibrant festivals, discover the stories behind each image as you solve.',
    'cover.feature1': 'Historical landmarks and temples',
    'cover.feature2': 'Traditional festivals and customs',
    'cover.feature3': 'Breathtaking landscapes',
    'cover.feature4': 'Delicious Vietnamese cuisine',
    'cover.difficulty.title': 'Multiple Difficulty Levels',
    'cover.difficulty.description': 'Choose from 2×2, 3×3, or 4×4 puzzle grids. Perfect for beginners and puzzle masters alike.',
    'cover.campaigns.title': 'Historical Campaigns',
    'cover.campaigns.description': 'Unlock special historical campaigns with milestone puzzles and educational content.',
    'cover.progress.title': 'Track Your Progress',
    'cover.progress.description': 'Save your best times and compete with friends. Track your improvement over time.',
    'cover.cta.title': 'Ready to Start Your Journey?',
    'cover.cta.description': 'Sign in with Google to save your progress and unlock all features',
    'cover.cta.button': 'Start Playing with Google',
    'cover.cta.note': 'Free to play • No credit card required • Instant access',
    'cover.footer': 'Experience the beauty and history of Vietnam through interactive puzzles',

    // Home Screen
    'home.title': 'Vietnamese Heritage Puzzle',
    'home.subtitle': 'Piece together, play together, remember our nation\'s history and culture!',
    'home.welcome': 'Welcome back, {name}! 🎉',
    'home.history.title': 'History',
    'home.history.description': 'Explore Vietnam\'s historical events through milestone-based puzzles',
    'home.culture.title': 'Culture',
    'home.culture.description': 'Immerse yourself in traditional arts, festivals, cuisine and Vietnam\'s cultural treasures',
    'home.bestTimes': 'Best Times',
      // Difficulty Selection
    'difficulty.beginner': 'Beginner',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.advanced': 'Advanced',
    'difficulty.beginner.desc': 'Perfect for a quick puzzle',
    'difficulty.intermediate.desc': 'A balanced challenge',
    'difficulty.advanced.desc': 'For puzzle masters',
    'difficulty.choose': 'Choose your puzzle size: fewer pieces for quick solving, more pieces for a challenge',
    'difficulty.pieces': 'pieces',
    
    // Puzzle Game
    'puzzle.preview': 'Preview',
    'puzzle.shuffle': 'Shuffle',
    'puzzle.time': 'Time',
    'puzzle.moves': 'Moves',
    'puzzle.best': 'BEST',
    
    // Victory Modal    'victory.congratulations': 'Congratulations!',
    'victory.completed': 'You have successfully completed the puzzle!',
    'victory.time': 'Time',
    'victory.moves': 'Moves',
    'victory.completed.label': 'Completed',
    'victory.newRecord': '🏆 New Record!',
    'victory.imageInfo': 'About this image:',
    'victory.audioInfo': '🎵 Listen to the story of this Vietnamese cultural heritage image',
    'victory.replay': 'Play Again',
    'victory.back': 'Back',
    'victory.home': 'Home',
      // Premium Features
    'premium.title': 'Premium Feature',
    'premium.subtitle': 'Upgrade to unlock all features',
    'premium.preview.locked': 'Preview Locked',
    'premium.preview.description': 'The "Preview" feature in culture mode is only for Premium accounts',
    'premium.history.locked': 'History Campaign Locked',
    'premium.history.description': 'You need a Premium account to access this content',
    'premium.campaign.locked': 'This campaign requires Premium',
    'premium.campaign.description': 'Upgrade to unlock all historical campaigns',
    'premium.benefits': 'Premium Benefits:','premium.benefit1': 'Preview images in all game modes',
    'premium.benefit2': 'Unlimited access to all history campaigns',
    'premium.benefit3': 'Support Vietnamese game development',
    'premium.close': 'Maybe Later',
    'premium.upgrade': 'Upgrade to Premium',
      // Campaigns    'campaigns.loading': 'Loading historical campaigns...',
    'campaigns.title': 'Historical Campaigns',
    'campaigns.subtitle': 'Journey through Vietnam\'s heroic past',
    'campaigns.difficulty': 'Choose difficulty:',
    'campaigns.unlock': 'Complete previous milestone to unlock',
    'campaigns.progress': '{completed}/{total} milestones completed',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.googleSignInFailed': 'Failed to sign in with Google',
      // Game
    'game.time': 'Time',
    'game.moves': 'Moves',
    'game.best': 'BEST',
    'game.preview': 'Preview',
    'game.shuffle': 'Shuffle',
    
    // Background Music
    'music.backgroundMusic': 'Background Music',
    'music.play': 'Play',
    'music.pause': 'Pause',
    'music.loading': 'Loading...',
    'music.settings': 'Music settings',
    'music.turnOff': 'Turn off background music',
    'music.enable': 'Enable background music',
    'music.volume': 'Volume',
    
    // Common
    'common.back': 'Back',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to Vietnamese
    const saved = localStorage.getItem('language') as Language;
    return saved || 'vi';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, String(params[param]));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
