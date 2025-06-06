import React from 'react';
import { X, Crown, Check, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade 
}) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;
  const premiumFeatures = [
    t('premium.benefit1'),
    t('premium.benefit2'), 
    t('premium.benefit3'),
    "Theo dõi thống kê chi tiết",
    "Không có quảng cáo",
    "Cập nhật nội dung mới sớm nhất"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>            <h2 className="text-2xl font-bold text-white mb-2">
              {t('premium.upgrade')}
            </h2>
            <p className="text-white/90 text-sm">
              {t('premium.subtitle')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Locked Feature Notice */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-red-600" />
              </div>
              <div>                <h3 className="font-semibold text-red-800">{t('premium.history.locked')}</h3>
                <p className="text-red-600 text-sm">
                  {t('premium.history.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-6">            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t('premium.title')}
            </h3>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-800">99.000₫</span>
                <span className="text-sm text-gray-600">/tháng</span>
              </div>
              <p className="text-yellow-700 text-sm font-medium">
                Hủy bất cứ lúc nào • Không cam kết dài hạn
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {t('premium.upgrade')}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition-colors"
            >
              {t('premium.close')}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Bằng cách nâng cấp, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
