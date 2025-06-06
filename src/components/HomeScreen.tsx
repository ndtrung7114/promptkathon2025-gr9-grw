import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BestTimes, GameTopic } from './GameLayout';
import { User } from '../contexts/UserContext';
import { LogIn, Crown, Shield, Lock } from 'lucide-react';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  onTopicSelect: (topic: GameTopic) => void;
  bestTimes: BestTimes;
  user: User | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onTopicSelect, bestTimes, user }) => {
  const [showBestTimes, setShowBestTimes] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Debug logging for admin status
  console.log('HomeScreen user:', { 
    email: user?.email, 
    role: user?.role, 
    isAdmin: user?.isAdmin,
    isPremium: user?.isPremium
  });

  const handleTopicSelect = (topic: GameTopic) => {
    // Check if user is trying to access history and is not premium
    if (topic === 'history' && user && !user.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    // Allow access for premium users or culture topic
    onTopicSelect(topic);
  };

  const handlePremiumUpgrade = () => {
    // TODO: Implement actual premium upgrade logic
    console.log('Premium upgrade requested');
    // For now, just close the modal
    setShowPremiumModal(false);
    // In a real app, you would integrate with a payment processor
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBestTimeDisplay = (topic: string, difficulty: number) => {
    const key = `${topic}-${difficulty}`;
    return bestTimes[key] ? formatTime(bestTimes[key]) : '--:--';
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dfhodnqig/image/upload/v1749190673/background_fu1od0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
      
      {/* Content with higher z-index */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">

        {/* Fixed Header Controls - properly spaced to prevent overlap */}
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-start px-4">
          {/* Language Toggle Button - Left side */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
            <LanguageToggle />
          </div>

          {/* Admin Panel Button for Admin Users - Right side */}
          {user && user.isAdmin && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            </div>
          )}
        </div>
      
        {/* Main Title Section */}
        <div className="text-center mb-12 animate-gentle-float mt-20">
          <h1 className="text-6xl md:text-7xl font-bold vietnam-title mb-4">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          {user && (
            <p className="text-lg text-green-600 mt-4">
              {t('home.welcome').replace('{name}', user.name || user.email)}
            </p>
          )}
        </div>

        {/* Topic Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 w-full max-w-4xl">
          {/* History Topic */}
          <div 
            onClick={() => handleTopicSelect('history')}
            className={`group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-105 border border-white/50 ${
              user && !user.isPremium ? 'opacity-90' : ''
            }`}
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 relative">
                <div className="text-white text-4xl">📜</div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                {user && !user.isPremium && (
                  <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('home.history.title')}
                <span className="text-yellow-500 ml-2">👑</span>
                {user && !user.isPremium && (
                  <span className="text-gray-500 ml-2">🔒</span>
                )}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {user && !user.isPremium 
                  ? t('premium.history.description')
                  : t('home.history.description')
                }
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Culture Topic */}
          <div 
            onClick={() => handleTopicSelect('culture')}
            className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-105 border border-white/50"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="text-white text-4xl">🎨</div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('home.culture.title')}</h2>
              <p className="text-gray-600 leading-relaxed">
                {t('home.culture.description')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Best Times Section - Hidden for now to reduce clutter */}
        <div className="w-full max-w-md">
          <button
            // onClick={() => setShowBestTimes(!showBestTimes)}
            // className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 border border-white/50"
          >
            {/* <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Thời gian tốt nhất</span>
              <span className={`transform transition-transform duration-300 ${showBestTimes ? 'rotate-180' : ''}`}>
                ⬇️
              </span>
            </div> */}
          </button>

          {showBestTimes && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl animate-fade-in border border-white/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2×2:</span>
                      <span className="font-mono">{getBestTimeDisplay('history', 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3×3:</span>
                      <span className="font-mono">{getBestTimeDisplay('history', 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4×4:</span>
                      <span className="font-mono">{getBestTimeDisplay('history', 4)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Culture</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2×2:</span>
                      <span className="font-mono">{getBestTimeDisplay('culture', 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3×3:</span>
                      <span className="font-mono">{getBestTimeDisplay('culture', 3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handlePremiumUpgrade}
      />
    </div>
  );
};

export default HomeScreen;
