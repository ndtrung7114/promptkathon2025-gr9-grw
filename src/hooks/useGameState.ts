// Game state management hook with database integration
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  gameSessionService,
  bestTimesService,
  campaignProgressService,
  achievementsService,
  userProfileService,
  gameImageService,
  type GameSession,
  type UserBestTime,
  type GameImage,
  type UserProfile
} from '../lib/supabase/database-existing';

export interface GameProgress {
  sessionId: string | null;
  startTime: Date | null;
  isPlaying: boolean;
  movesCount: number;
  hintsUsed: number;
}

export interface UseGameStateResult {
  // Game state
  gameProgress: GameProgress;
  bestTimes: { [key: string]: number };
  userProfile: UserProfile | null;
  gameImages: GameImage[];
  recentSessions: GameSession[];
  
  // Game actions
  startGame: (imageId: string, topic: 'history' | 'culture', difficulty: 2 | 3 | 4) => Promise<void>;
  completeGame: (completionTime: number) => Promise<void>;
  updateMoves: (moves: number) => void;
  updateHints: (hints: number) => void;
  
  // Data loading
  loadUserData: () => Promise<void>;
  loadGameImages: () => Promise<void>;
  
  // Best times
  getBestTime: (imageId: string, topic: 'history' | 'culture', difficulty: 2 | 3 | 4) => number | null;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
}

export const useGameState = (): UseGameStateResult => {
  const { user } = useUser();
  
  // State
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    sessionId: null,
    startTime: null,
    isPlaying: false,
    movesCount: 0,
    hintsUsed: 0
  });
  
  const [bestTimes, setBestTimes] = useState<{ [key: string]: number }>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gameImages, setGameImages] = useState<GameImage[]>([]);
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load user data when user logs in
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user profile
      const profile = await userProfileService.getUserProfile(user.id);
      setUserProfile(profile);
      
      // Load best times
      const userBestTimes = await bestTimesService.getBestTimes(user.id);
      setBestTimes(userBestTimes);
      
      // Load recent sessions
      const sessions = await gameSessionService.getUserSessions(user.id, 10);
      setRecentSessions(sessions);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load game images
  const loadGameImages = useCallback(async () => {
    try {
      const images = await gameImageService.getAllImages();
      setGameImages(images);
    } catch (error) {
      console.error('Error loading game images:', error);
    }
  }, []);
  // Start a new game
  const startGame = useCallback(async (
    imageId: string, 
    topic: 'history' | 'culture', 
    difficulty: 2 | 3 | 4
  ) => {
    if (!user) return;
    
    try {
      const session = await gameSessionService.createSession({
        user_id: user.id,
        image_id: imageId,
        topic,
        difficulty
      });
      if (session) {
        setGameProgress({
          sessionId: session.id,
          startTime: new Date(),
          isPlaying: true,
          movesCount: 0,
          hintsUsed: 0
        });
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [user]);  // Complete a game
  const completeGame = useCallback(async (completionTime: number) => {
    if (!user || !gameProgress.sessionId) return;
    
    setIsSubmitting(true);
    try {
      // Complete the session
      const completedSession = await gameSessionService.completeSession(
        gameProgress.sessionId,
        {
          completion_time: completionTime,
          moves_count: gameProgress.movesCount,
          hints_used: gameProgress.hintsUsed
        }
      );
      
      if (completedSession) {
        // Update best time if this is a new record
        if (completedSession.image_id && completedSession.topic && completedSession.difficulty) {
          const key = `${completedSession.image_id}-${completedSession.topic}-${completedSession.difficulty}`;
          const currentBest = bestTimes[key];
          
          if (!currentBest || completionTime < currentBest) {
            await bestTimesService.updateBestTime(
              user.id,
              completedSession.image_id,
              completedSession.topic,
              completedSession.difficulty,
              completionTime,
              completedSession.id
            );
            
            // Update local state
            setBestTimes(prev => ({
              ...prev,
              [key]: completionTime
            }));
          }
        }
        
        // Update user stats
        await userProfileService.incrementGameStats(user.id, completionTime);
        
        // Check for achievements
        await checkAndAwardAchievements(completedSession, completionTime);
        
        // Reload user data to get updated stats
        await loadUserData();
      }
      
      // Reset game progress
      setGameProgress({
        sessionId: null,
        startTime: null,
        isPlaying: false,
        movesCount: 0,
        hintsUsed: 0
      });
      
    } catch (error) {
      console.error('Error completing game:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, gameProgress, bestTimes, loadUserData]);

  // Update moves count
  const updateMoves = useCallback((moves: number) => {
    setGameProgress(prev => ({ ...prev, movesCount: moves }));
  }, []);

  // Update hints used
  const updateHints = useCallback((hints: number) => {
    setGameProgress(prev => ({ ...prev, hintsUsed: hints }));
  }, []);

  // Get best time for specific game
  const getBestTime = useCallback((
    imageId: string, 
    topic: 'history' | 'culture', 
    difficulty: 2 | 3 | 4
  ): number | null => {
    const key = `${imageId}-${topic}-${difficulty}`;
    return bestTimes[key] || null;
  }, [bestTimes]);
  // Check and award achievements
  const checkAndAwardAchievements = useCallback(async (
    session: GameSession,
    completionTime: number
  ) => {
    if (!user) return;
    
    try {
      // Speed achievements
      if (completionTime < 60) { // Under 1 minute
        await achievementsService.awardAchievement(
          user.id,
          'speed_demon',
          'Speed Demon',
          'Complete a puzzle in under 1 minute',
          session.id,
          { completion_time: completionTime, difficulty: session.difficulty }
        );
      }
      
      if (completionTime < 30) { // Under 30 seconds
        await achievementsService.awardAchievement(
          user.id,
          'lightning_fast',
          'Lightning Fast',
          'Complete a puzzle in under 30 seconds',
          session.id,
          { completion_time: completionTime, difficulty: session.difficulty }
        );
      }
      
      // Topic-specific achievements
      const userSessions = await gameSessionService.getUserSessions(user.id, 100);
      const historySessions = userSessions.filter(s => s.topic === 'history' && s.is_completed);
      const cultureSessions = userSessions.filter(s => s.topic === 'culture' && s.is_completed);
      
      if (historySessions.length >= 10) {
        await achievementsService.awardAchievement(
          user.id,
          'history_buff',
          'History Buff',
          'Complete 10 history puzzles',
          session.id,
          { completed_history_puzzles: historySessions.length }
        );
      }
      
      if (cultureSessions.length >= 10) {
        await achievementsService.awardAchievement(
          user.id,
          'culture_expert',
          'Culture Expert',
          'Complete 10 culture puzzles',
          session.id,
          { completed_culture_puzzles: cultureSessions.length }
        );
      }
      
      // Total games achievements
      const totalCompleted = userSessions.filter(s => s.is_completed).length;
      if (totalCompleted >= 50) {
        await achievementsService.awardAchievement(
          user.id,
          'puzzle_master',
          'Puzzle Master',
          'Complete 50 puzzles',
          session.id,
          { total_completed: totalCompleted }
        );
      }
      
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Reset state when user logs out
      setUserProfile(null);
      setBestTimes({});
      setRecentSessions([]);
      setGameProgress({
        sessionId: null,
        startTime: null,
        isPlaying: false,
        movesCount: 0,
        hintsUsed: 0
      });
    }
  }, [user, loadUserData]);

  // Load game images on mount
  useEffect(() => {
    loadGameImages();
  }, [loadGameImages]);

  // Legacy support: Load best times from localStorage for migration
  useEffect(() => {
    if (!user) {
      // For non-logged-in users, still load from localStorage
      const savedTimes = localStorage.getItem('vietnam-puzzle-best-times');
      if (savedTimes) {
        try {
          const localBestTimes = JSON.parse(savedTimes);
          setBestTimes(localBestTimes);
        } catch (error) {
          console.error('Error parsing local best times:', error);
        }
      }
    }
  }, [user]);

  return {
    gameProgress,
    bestTimes,
    userProfile,
    gameImages,
    recentSessions,
    startGame,
    completeGame,
    updateMoves,
    updateHints,
    loadUserData,
    loadGameImages,
    getBestTime,
    isLoading,
    isSubmitting
  };
};
