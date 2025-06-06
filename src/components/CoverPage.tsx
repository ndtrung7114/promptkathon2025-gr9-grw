import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import LanguageToggle from './LanguageToggle';

const CoverPage = () => {
  const { loginWithGoogle } = useUser();
  const { t } = useLanguage();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.googleSignInFailed'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen watercolor-bg">
      {/* Fixed Header Controls */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <LanguageToggle />
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 mt-16">
          <h1 className="text-6xl font-bold text-red-700 mb-4 vietnam-title">
            {t('cover.title')}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {t('cover.subtitle')}
          </p>
          
          {/* Hero Image/Demo */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {t('cover.hero.title')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('cover.hero.description')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📜</span>
                      <span>{t('cover.feature1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎨</span>
                      <span>{t('cover.feature2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌄</span>
                      <span>{t('cover.feature3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍜</span>
                      <span>{t('cover.feature4')}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-red-100 to-yellow-100 rounded-2xl p-6 shadow-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 9 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            animation: 'fadeIn 0.6s ease-in-out forwards'
                          }}
                        >
                          {['🏯', '🎋', '🌸', '🍃', '⛩️', '🎎', '🏔️', '🌊', '🌺'][i]}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl animate-bounce">
                    ✨
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <CardTitle className="text-xl text-red-700">{t('cover.difficulty.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('cover.difficulty.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle className="text-xl text-red-700">{t('cover.progress.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('cover.progress.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🌸</div>
              <CardTitle className="text-xl text-red-700">{t('cover.culture.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('cover.culture.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-700 mb-4">
                {t('cover.cta.title')}
              </CardTitle>
              <CardDescription className="text-lg">
                {t('cover.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('cover.cta.button')}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {t('cover.cta.note')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            {t('cover.footer')}
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
    </div>
  );
};

export default CoverPage;
