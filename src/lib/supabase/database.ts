// Database service for Vietnam Heritage Jigsaw Quest
import { supabase } from './client';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  total_games_played: number;
  total_time_played: number;
  favorite_topic?: 'history' | 'culture';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  updated_at: string;
}

export interface GameImage {
  id: string;
  title: string;
  description?: string;
  topic: 'history' | 'culture';
  image_url: string;
  thumbnail_url?: string;
  difficulty_levels: number[];
  location?: string;
  historical_period?: string;
  cultural_significance?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  image_id: string;
  topic: 'history' | 'culture';
  difficulty: 2 | 3 | 4;
  start_time: string;
  end_time?: string;
  completion_time?: number;
  is_completed: boolean;
  moves_count: number;
  hints_used: number;
  score: number;
  created_at: string;
}

export interface UserBestTime {
  id: string;
  user_id: string;
  image_id: string;
  topic: 'history' | 'culture';
  difficulty: 2 | 3 | 4;
  best_time: number;
  achieved_at: string;
  session_id?: string;
}

export interface CampaignProgress {
  id: string;
  user_id: string;
  campaign_id: string;
  milestone_id: string;
  is_completed: boolean;
  completed_at?: string;
  completion_time?: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description?: string;
  earned_at: string;
  data?: any;
}

// User Profile Services
export const userProfileService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    return data;
  },

  // Increment games played and time
  async incrementGameStats(userId: string, timeSpent: number): Promise<void> {
    const { error } = await supabase.rpc('increment_game_stats', {
      user_id: userId,
      time_to_add: timeSpent
    });

    if (error) {
      console.error('Error incrementing game stats:', error);
    }
  }
};

// Game Images Services
export const gameImageService = {
  // Get all active game images
  async getAllImages(): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching game images:', error);
      return [];
    }
    return data || [];
  },

  // Get images by topic
  async getImagesByTopic(topic: 'history' | 'culture'): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('topic', topic)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images by topic:', error);
      return [];
    }
    return data || [];
  },

  // Get single image
  async getImage(imageId: string): Promise<GameImage | null> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) {
      console.error('Error fetching image:', error);
      return null;
    }
    return data;
  },

  // Add new image
  async addImage(imageData: Omit<GameImage, 'id' | 'created_at' | 'updated_at'>): Promise<GameImage | null> {
    const { data, error } = await supabase
      .from('game_images')
      .insert(imageData)
      .select()
      .single();

    if (error) {
      console.error('Error adding image:', error);
      return null;
    }
    return data;
  }
};

// Game Session Services
export const gameSessionService = {
  // Start a new game session
  async startSession(userId: string, imageId: string, topic: 'history' | 'culture', difficulty: 2 | 3 | 4): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        image_id: imageId,
        topic,
        difficulty,
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting game session:', error);
      return null;
    }
    return data;
  },

  // Complete a game session
  async completeSession(
    sessionId: string, 
    completionTime: number, 
    movesCount: number = 0, 
    hintsUsed: number = 0
  ): Promise<GameSession | null> {
    const score = calculateScore(completionTime, movesCount, hintsUsed);
    
    const { data, error } = await supabase
      .from('game_sessions')
      .update({
        end_time: new Date().toISOString(),
        completion_time: completionTime,
        is_completed: true,
        moves_count: movesCount,
        hints_used: hintsUsed,
        score
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error completing game session:', error);
      return null;
    }
    return data;
  },

  // Get user's game sessions
  async getUserSessions(userId: string, limit: number = 50): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        game_images (
          title,
          topic,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
    return data || [];
  }
};

// Best Times Services
export const bestTimesService = {
  // Get user's best times
  async getUserBestTimes(userId: string): Promise<UserBestTime[]> {
    const { data, error } = await supabase
      .from('user_best_times')
      .select(`
        *,
        game_images (
          title,
          topic,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('best_time', { ascending: true });

    if (error) {
      console.error('Error fetching best times:', error);
      return [];
    }
    return data || [];
  },

  // Update or insert best time
  async updateBestTime(
    userId: string,
    imageId: string,
    topic: 'history' | 'culture',
    difficulty: 2 | 3 | 4,
    newTime: number,
    sessionId?: string
  ): Promise<UserBestTime | null> {
    // First check if there's an existing best time
    const { data: existing } = await supabase
      .from('user_best_times')
      .select('best_time')
      .eq('user_id', userId)
      .eq('image_id', imageId)
      .eq('topic', topic)
      .eq('difficulty', difficulty)
      .single();

    // Only update if new time is better or no existing time
    if (!existing || newTime < existing.best_time) {
      const { data, error } = await supabase
        .from('user_best_times')
        .upsert({
          user_id: userId,
          image_id: imageId,
          topic,
          difficulty,
          best_time: newTime,
          session_id: sessionId,
          achieved_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating best time:', error);
        return null;
      }
      return data;
    }
    
    return null; // No update needed
  }
};

// Campaign Progress Services
export const campaignProgressService = {
  // Get user's campaign progress
  async getUserProgress(userId: string): Promise<CampaignProgress[]> {
    const { data, error } = await supabase
      .from('campaign_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaign progress:', error);
      return [];
    }
    return data || [];
  },

  // Mark milestone as completed
  async completeMilestone(
    userId: string,
    campaignId: string,
    milestoneId: string,
    completionTime?: number
  ): Promise<CampaignProgress | null> {
    const { data, error } = await supabase
      .from('campaign_progress')
      .upsert({
        user_id: userId,
        campaign_id: campaignId,
        milestone_id: milestoneId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        completion_time: completionTime
      })
      .select()
      .single();

    if (error) {
      console.error('Error completing milestone:', error);
      return null;
    }
    return data;
  }
};

// Achievements Services
export const achievementsService = {
  // Get user achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
    return data || [];
  },

  // Award achievement
  async awardAchievement(
    userId: string,
    achievementType: string,
    achievementName: string,
    description?: string,
    data?: any
  ): Promise<UserAchievement | null> {
    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_type', achievementType)
      .single();

    if (existing) {
      return null; // Achievement already exists
    }

    const { data: newAchievement, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description,
        data,
        earned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
    return newAchievement;
  }
};

// Utility function to calculate score
function calculateScore(completionTime: number, movesCount: number, hintsUsed: number): number {
  const baseScore = 1000;
  const timeBonus = Math.max(0, baseScore - completionTime);
  const movePenalty = movesCount * 5;
  const hintPenalty = hintsUsed * 50;
  
  return Math.max(0, baseScore + timeBonus - movePenalty - hintPenalty);
}

// Image upload service
export const imageUploadService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, bucket: string = 'game-images'): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Delete image from Supabase Storage
  async deleteImage(imagePath: string, bucket: string = 'game-images'): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    return true;
  }
};
