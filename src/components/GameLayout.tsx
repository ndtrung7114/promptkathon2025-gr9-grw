import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DifficultySelection from './DifficultySelection';
import PuzzleGame from './PuzzleGame';
import HistoricalCampaigns from './HistoricalCampaigns';
import MilestoneSelection from './MilestoneSelection';
import AuthModal from './AuthModal';
import CoverPage from './CoverPage';
import BackgroundMusicControl from './BackgroundMusicControl';
import { UserProvider, useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useGameState } from '../hooks/useGameState';
import { useCampaign } from '../hooks/useCampaign';
import { markMilestoneCompleted as markMilestoneCompletedDB } from '../lib/supabase/gameProgressService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User, LogOut, Crown, Shield } from 'lucide-react';

export type GameTopic = 'history' | 'culture';
export type DifficultyLevel = 2 | 3 | 4;

export interface BestTimes {
  [key: string]: number;
}

type GameScreen = 'home' | 'topic' | 'difficulty' | 'puzzle' | 'campaigns' | 'milestones';

const GameLayoutInner = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [selectedTopic, setSelectedTopic] = useState<GameTopic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'upgrade' }>({
    isOpen: false,
    mode: 'login'
  });
  const { user, loading, logout } = useUser();
  const { t } = useLanguage();
  const gameState = useGameState();
  const { campaign: selectedCampaignData } = useCampaign(selectedCampaign || '');

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      gameState.loadUserData();
      gameState.loadGameImages();
    }
  }, [user]);

  // Backward compatibility: sync with localStorage for existing best times
  useEffect(() => {
    const savedTimes = localStorage.getItem('vietnam-puzzle-best-times');
    if (savedTimes && user) {
      const localBestTimes = JSON.parse(savedTimes);
      // The useGameState hook will handle syncing these with the database
    }
  }, [user]);  // Show loading screen while authentication is being checked - moved after all hooks
  if (loading) {
    return (
      <div className="min-h-screen watercolor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show cover page for non-authenticated users
  if (!user) {
    return <CoverPage />;
  }

  const handleTopicSelect = (topic: GameTopic) => {
    setSelectedTopic(topic);
    
    // If history topic, go directly to campaigns (no upgrade needed)
    if (topic === 'history') {
      setCurrentScreen('campaigns');
    } else {
      // Culture topic goes to normal difficulty selection
      setCurrentScreen('difficulty');
    }
  };
  const handleDifficultySelect = async (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    
    // Start a new game session in the database
    if (selectedTopic && user) {
      try {
        // For now, we'll use the first available image for the topic
        // In the future, this should be selected by the user or randomly chosen
        const availableImages = gameState.gameImages.filter(img => img.topic === selectedTopic);
        if (availableImages.length > 0) {
          const selectedImage = availableImages[0]; // Use first available image
          setSelectedImageId(selectedImage.id);
          await gameState.startGame(selectedImage.id, selectedTopic, difficulty);
        }
      } catch (error) {
        console.error('Error starting game:', error);
      }
    }
    
    setCurrentScreen('puzzle');
  };

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setCurrentScreen('milestones');
  };  const handleMilestoneSelect = async (milestoneId: string, difficulty: DifficultyLevel) => {
    setSelectedMilestone(milestoneId);
    setSelectedDifficulty(difficulty);
    
    // The PuzzleGame component will handle image selection from the database
    // based on the milestoneId, so we don't need to pre-select images here
    
    setCurrentScreen('puzzle');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setSelectedCampaign(null);
    setSelectedMilestone(null);
  };

  const handleBackToDifficulty = () => {
    setCurrentScreen('difficulty');
    setSelectedDifficulty(null);
  };

  const handleBackToCampaigns = () => {
    setCurrentScreen('campaigns');
    setSelectedCampaign(null);
    setSelectedMilestone(null);
    setSelectedDifficulty(null);
  };

  const handleBackToMilestones = () => {
    setCurrentScreen('milestones');
    setSelectedMilestone(null);
    setSelectedDifficulty(null);
  };  const handlePuzzleComplete = async (timeInSeconds: number, moves?: number, hints?: number) => {
    // Handle milestone completion with database tracking
    if (selectedMilestone && selectedDifficulty && user && (selectedDifficulty === 2 || selectedDifficulty === 3)) {
      try {
        // Use database milestone tracking with proper parameter order
        await markMilestoneCompletedDB(user.id, selectedMilestone, selectedDifficulty, timeInSeconds, 0, moves, hints);
        console.log('Milestone completed in database:', selectedMilestone);
      } catch (error) {
        console.error('Error marking milestone completed in database:', error);
      }
    }

    // Complete the game in the database
    if (selectedTopic && selectedDifficulty && selectedImageId) {
      try {
        await gameState.completeGame(timeInSeconds);
      } catch (error) {
        console.error('Error completing game:', error);
        // Fallback to localStorage for backward compatibility
        const key = selectedMilestone 
          ? `milestone-${selectedMilestone}-${selectedDifficulty}`
          : `${selectedTopic}-${selectedDifficulty}`;
        
        const savedTimes = localStorage.getItem('vietnam-puzzle-best-times');
        const currentBestTimes = savedTimes ? JSON.parse(savedTimes) : {};
        const currentBest = currentBestTimes[key];
        
        if (!currentBest || timeInSeconds < currentBest) {
          const newBestTimes = {
            ...currentBestTimes,
            [key]: timeInSeconds
          };
          localStorage.setItem('vietnam-puzzle-best-times', JSON.stringify(newBestTimes));
        }
      }
    }
  };
  const getCurrentBestTime = (): number | null => {
    if (selectedTopic && selectedDifficulty && selectedImageId) {
      // Try to get from database first
      const dbBestTime = gameState.getBestTime(selectedImageId, selectedTopic, selectedDifficulty);
      if (dbBestTime !== null) {
        return dbBestTime;
      }

      // Fallback to localStorage
      const key = selectedMilestone 
        ? `milestone-${selectedMilestone}-${selectedDifficulty}`
        : `${selectedTopic}-${selectedDifficulty}`;
      
      const savedTimes = localStorage.getItem('vietnam-puzzle-best-times');
      if (savedTimes) {
        const bestTimes = JSON.parse(savedTimes);
        return bestTimes[key] || null;
      }
    }
    return null;
  };

  const handleUpgrade = () => {
    // No longer needed, but keep for compatibility
    if (user) {
      // Just close any modal that might be open
      setAuthModal({ ...authModal, isOpen: false });
    } else {
      setAuthModal({ isOpen: true, mode: 'register' });
    }
  };

  const getBackHandler = () => {
    switch (currentScreen) {
      case 'difficulty':
        return handleBackToHome;
      case 'campaigns':
        return handleBackToHome;
      case 'milestones':
        return handleBackToCampaigns;
      case 'puzzle':
        if (selectedMilestone) return handleBackToMilestones;
        return handleBackToDifficulty;
      default:
        return handleBackToHome;
    }
  };

  return (
    <div className="min-h-screen watercolor-bg">      {/* Profile Menu */}
      {user && (
        <div className="absolute top-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <div className="flex items-center gap-1">
                      {user.isPremium && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                      {user.isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />              {user.isAdmin && (
                <>
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="cursor-pointer"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}{currentScreen === 'home' && (
        <HomeScreen 
          onTopicSelect={handleTopicSelect}
          bestTimes={gameState.bestTimes}
          user={user}
        />
      )}
      
      {currentScreen === 'difficulty' && selectedTopic && (
        <DifficultySelection
          topic={selectedTopic}
          onDifficultySelect={handleDifficultySelect}
          onBack={getBackHandler()}
          bestTimes={gameState.bestTimes}
        />
      )}

      {currentScreen === 'campaigns' && (
        <HistoricalCampaigns
          onCampaignSelect={handleCampaignSelect}
          onBack={getBackHandler()}
          onUpgrade={handleUpgrade}
        />
      )}

      {currentScreen === 'milestones' && selectedCampaign && (
        <MilestoneSelection
          campaignId={selectedCampaign}
          onMilestoneSelect={handleMilestoneSelect}
          onBack={getBackHandler()}
        />
      )}        {currentScreen === 'puzzle' && selectedTopic && selectedDifficulty && (
        <PuzzleGame
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          milestoneId={selectedMilestone}
          milestoneData={selectedMilestone && selectedCampaignData 
            ? selectedCampaignData.milestones.find(m => m.id === selectedMilestone) || null 
            : null}
          onBack={getBackHandler()}
          onComplete={handlePuzzleComplete}
          onHome={handleBackToHome}
          currentBestTime={getCurrentBestTime()}
          gameState={{
            updateMoves: gameState.updateMoves,
            updateHints: gameState.updateHints,
          }}
        />
      )}

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
      />
      
      {/* Background Music Control */}
      <BackgroundMusicControl />
    </div>
  );
};

const GameLayout = () => {
  return (
    <UserProvider>
      <GameLayoutInner />
    </UserProvider>
  );
};

export default GameLayout;
