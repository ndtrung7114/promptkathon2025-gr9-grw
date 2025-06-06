
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Trophy, Loader2, Lock, Crown } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCampaignProgress } from '../hooks/useCampaignProgress';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface HistoricalCampaignsProps {
  onCampaignSelect: (campaignId: string) => void;
  onBack: () => void;
  onUpgrade: () => void;
}

const HistoricalCampaigns: React.FC<HistoricalCampaignsProps> = ({
  onCampaignSelect,
  onBack,
  onUpgrade
}) => {
  const { user } = useUser();
  const { t } = useLanguage();
  const { campaigns, loading, error } = useCampaigns('history');
  const { getProgress } = useCampaignProgress();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const handleCampaignSelect = (campaign: any) => {
    // Check if campaign requires premium access (order > 1)
    const requiresPremium = campaign.order > 1;
    const userIsPremium = user?.isPremium || false;

    if (requiresPremium && !userIsPremium) {
      setShowPremiumModal(true);
      return;
    }

    // Allow access for order = 1 or premium users
    onCampaignSelect(campaign.id);
  };// Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        {/* Fixed Header */}
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-center px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            <LanguageToggle />
          </div>
        </div>
        
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">{t('campaigns.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        {/* Fixed Header */}
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-center px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            <LanguageToggle />
          </div>
          
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading campaigns: {error}</p>
          <button
            onClick={onBack}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }return (
    <div className="min-h-screen p-6">
      {/* Fixed Header */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-between items-center px-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
          <LanguageToggle />
        </div>
        
        <button
          onClick={onBack}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      
      {/* Main Content with margin-top for fixed header */}
      <div className="mt-20">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold vietnam-title mb-2">{t('campaigns.title')}</h1>
          <p className="text-gray-600">{t('campaigns.subtitle')}</p>
        </div>          {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">          {campaigns.map((campaign) => {
            const progress = getProgress(campaign);
            const isCompleted = progress.completed === progress.total;
            const requiresPremium = campaign.order > 1;
            const userIsPremium = user?.isPremium || false;
            const isLocked = requiresPremium && !userIsPremium;

            return (
              <div
                key={campaign.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer hover:scale-105 ${
                  isLocked ? 'opacity-75' : ''
                }`}
                onClick={() => handleCampaignSelect(campaign)}
              >
                {/* Campaign Image */}
                <div className="relative mb-4">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className={`w-full h-32 object-cover rounded-2xl ${
                      isLocked ? 'filter grayscale' : ''
                    }`}
                  />
                  
                  {/* Premium Lock Badge */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                      <div className="bg-yellow-500 rounded-full p-3 shadow-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Premium Badge for locked campaigns */}
                  {requiresPremium && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-2 py-1 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">PREMIUM</span>
                    </div>
                  )}
                  
                  {/* Completion Badge */}
                  {isCompleted && !isLocked && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Campaign Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{campaign.period}</p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* Lock Message for Premium Campaigns */}
                  {isLocked && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-700 font-medium">
                        {t('premium.campaign.locked')}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {t('premium.campaign.description')}
                      </p>
                    </div>
                  )}

                  {/* Progress Bar - only show for accessible campaigns */}
                  {!isLocked && (
                    <>
                      <div className="bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        ></div>
                      </div>                      {/* Progress Text */}
                      <p className="text-xs text-gray-500">
                        {t('campaigns.progress', { completed: progress.completed, total: progress.total })}
                      </p>
                    </>
                  )}
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isLocked 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' 
                    : 'bg-gradient-to-r from-red-500/5 to-yellow-500/5'
                }`}></div>
              </div>
            );
          })}
        </div>

        {/* Premium Upgrade Modal */}
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            setShowPremiumModal(false);
            onUpgrade();
          }}
        />
      </div>
    </div>
  );
};

export default HistoricalCampaigns;
