import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const CoverPage = () => {
  const { loginWithGoogle } = useUser();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen watercolor-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-red-700 mb-4 vietnam-title">
            🧩 Vietnam Heritage Jigsaw Quest
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Discover Vietnam's Beautiful Heritage Through Interactive Puzzles
          </p>
          
          {/* Hero Image/Demo */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Explore Vietnam's Rich Culture
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Immerse yourself in Vietnam's stunning heritage through beautifully crafted jigsaw puzzles. 
                    From ancient temples to vibrant festivals, discover the stories behind each image as you solve.
                  </p>                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📜</span>
                      <span>Historical landmarks and temples</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎨</span>
                      <span>Traditional festivals and customs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌄</span>
                      <span>Breathtaking landscapes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍜</span>
                      <span>Delicious Vietnamese cuisine</span>
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
              <CardTitle className="text-xl text-red-700">Multiple Difficulty Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Choose from 2×2, 3×3, or 4×4 puzzle grids. Perfect for beginners and puzzle masters alike.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle className="text-xl text-red-700">Historical Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Unlock special historical campaigns with milestone puzzles and educational content.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <CardTitle className="text-xl text-red-700">Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Save your best times and compete with friends. Track your improvement over time.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-700 mb-2">
                Ready to Start Your Journey?
              </CardTitle>
              <CardDescription>
                Sign in with Google to save your progress and unlock all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300"
                size="lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Start Playing with Google
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Free to play • No credit card required • Instant access
              </p>
            </CardContent>
          </Card>
        </div>        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">
            Experience the beauty and history of Vietnam through interactive puzzles
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `
      }} />
    </div>
  );
};

export default CoverPage;
