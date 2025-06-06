import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DifficultySelection from './DifficultySelection';
import PuzzleGame from './PuzzleGame';
import HistoricalCampaigns from './HistoricalCampaigns';
import MilestoneSelection from './MilestoneSelection';
import AuthModal from './AuthModal';
import { UserProvider, useUser } from '../contexts/UserContext';
import { markMilestoneCompleted } from '../lib/supabase/campaignService';

export type GameTopic = 'history' | 'culture';
export type DifficultyLevel = 2 | 3; // Changed from 2|3|4 to match campaignService

export interface BestTimes {
  [key: string]: number;
}

type GameScreen = 'home' | 'topic' | 'difficulty' | 'puzzle' | 'campaigns' | 'milestones';

const GameLayoutInner = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [selectedTopic, setSelectedTopic] = useState<GameTopic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [bestTimes, setBestTimes] = useState<BestTimes>({});
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'upgrade' }>({
    isOpen: false,
    mode: 'login'
  });

  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  // Load best times from localStorage on component mount
  useEffect(() => {
    const savedTimes = localStorage.getItem('vietnam-puzzle-best-times');
    if (savedTimes) {
      setBestTimes(JSON.parse(savedTimes));
    }
  }, []);

  // Save best times to localStorage whenever bestTimes changes
  useEffect(() => {
    localStorage.setItem('vietnam-puzzle-best-times', JSON.stringify(bestTimes));
  }, [bestTimes]);

  // Show loading screen while authentication is being checked - moved after all hooks
  if (loading) {
    return (
      <div className="min-h-screen watercolor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    setCurrentScreen('puzzle');
  };

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setCurrentScreen('milestones');
  };

  const handleMilestoneSelect = (milestoneId: string, difficulty: DifficultyLevel) => {
    setSelectedMilestone(milestoneId);
    setSelectedDifficulty(difficulty);
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
  };  const handlePuzzleComplete = async (timeInSeconds: number, moves = 0, hints = 0) => {
    // Handle milestone completion for advantage users
    if (selectedMilestone && user?.id) {
      try {
        // Only pass difficulty 2 or 3, not 4 as it's not supported by the API
        const safeDifficulty = (selectedDifficulty && (selectedDifficulty === 2 || selectedDifficulty === 3)) 
          ? selectedDifficulty 
          : 3; // Default to 3 if not 2 or 3
          
        await markMilestoneCompleted(
          selectedMilestone,
          safeDifficulty,
          user.id,
          timeInSeconds,
          100, // default score
          moves, // Add moves parameter
          hints  // Add hints parameter
        );
      } catch (error) {
        console.error('Error marking milestone completed:', error);
      }
    }

    // Handle regular best times
    if (selectedTopic && selectedDifficulty) {
      const key = selectedMilestone 
        ? `milestone-${selectedMilestone}-${selectedDifficulty}`
        : `${selectedTopic}-${selectedDifficulty}`;
      
      const currentBest = bestTimes[key];
      
      if (!currentBest || timeInSeconds < currentBest) {
        setBestTimes(prev => ({
          ...prev,
          [key]: timeInSeconds
        }));
      }
    }
  };

  const getCurrentBestTime = (): number | null => {
    if (selectedTopic && selectedDifficulty) {
      const key = selectedMilestone 
        ? `milestone-${selectedMilestone}-${selectedDifficulty}`
        : `${selectedTopic}-${selectedDifficulty}`;
      return bestTimes[key] || null;
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
    <div className="min-h-screen watercolor-bg">      {/* User Menu */}
      {user && (
        <div className="absolute top-6 right-6 z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg group relative">
            <div className="flex items-center gap-3">
              {user.avatar_url && (
                <img 
                  src={user.avatar_url} 
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600">
                {user.name || user.email} {user.hasAdvantage && '👑'}
                {user.isAdmin && <span className="text-red-600 ml-1">👨‍💼</span>}
              </span>
              
              {/* Admin Panel Button */}
              {user.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                >
                  Admin
                </button>
              )}
              
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}      {currentScreen === 'home' && (
        <HomeScreen 
          onTopicSelect={handleTopicSelect}
          bestTimes={bestTimes}
          user={user}
        />
      )}
      
      {currentScreen === 'difficulty' && selectedTopic && (
        <DifficultySelection
          topic={selectedTopic}
          onDifficultySelect={handleDifficultySelect}
          onBack={getBackHandler()}
          bestTimes={bestTimes}
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
      )}
      
      {currentScreen === 'puzzle' && selectedTopic && selectedDifficulty && (
        <PuzzleGame
          topic={selectedTopic}
          difficulty={selectedDifficulty}
          milestoneId={selectedMilestone}
          onBack={getBackHandler()}
          onComplete={handlePuzzleComplete}
          onHome={handleBackToHome}
          currentBestTime={getCurrentBestTime()}
        />
      )}

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
      />
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
