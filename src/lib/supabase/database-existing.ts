// Database service layer adapted for existing Supabase tables
// This version works with your existing 'profiles' and 'game_progress' tables

import { supabase } from './client';

// Admin role types
export type UserRole = 'user' | 'admin' | 'moderator';
export type AdminPermission = 'manage_images' | 'manage_campaigns' | 'manage_admins' | 'manage_users';

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator';
  permissions: AdminPermission[];
  granted_by: string | null;
  granted_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types adapted to your existing schema
export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null; // Maps to full_name in your profiles table
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  total_games_played: number;
  total_time_played: number;
  favorite_topic: 'history' | 'culture' | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  role: UserRole; // Added admin role support
  is_premium: boolean; // Premium user status
}

export interface GameImage {
  id: string;
  title: string;
  description: string | null;
  topic: 'history' | 'culture';
  image_url: string;
  thumbnail_url: string | null;
  difficulty_levels: number[];
  location: string | null;
  historical_period: string | null;
  cultural_significance: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Adapted to work with your existing game_progress table
export interface GameSession {
  id: string;
  user_id: string;
  image_id: string | null;
  topic: 'history' | 'culture' | null;
  difficulty: 2 | 3 | 4 | null;
  start_time: string | null;
  end_time: string | null;
  completion_time: number | null;
  is_completed: boolean;
  moves_count: number;
  hints_used: number;
  created_at: string;
  // Your existing fields
  level_id: string;
  time_taken: number | null;
  score: number;
}

export interface UserBestTime {
  id: string;
  user_id: string;
  image_id: string;
  topic: 'history' | 'culture';
  difficulty: 2 | 3 | 4;
  best_time: number;
  best_moves: number | null;
  achieved_at: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignProgress {
  id: string;
  user_id: string;
  campaign_id: string;
  milestone_id: string;
  completed_at: string | null;
  difficulty: 2 | 3 | 4 | null;
  completion_time: number | null;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  earned_at: string;
  session_id: string | null;
  metadata: any;
  created_at: string;
}

// User Profile Service (using your existing 'profiles' table)
export const userProfileService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles') // Using your existing table
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Map your schema to our expected format
    return {
      ...data,
      name: data.full_name, // Map full_name to name
    };
  },

  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: profileData.email,
        full_name: profileData.name, // Map name to full_name
        avatar_url: profileData.avatar_url,
        total_games_played: profileData.total_games_played || 0,
        total_time_played: profileData.total_time_played || 0,
        favorite_topic: profileData.favorite_topic,
        skill_level: profileData.skill_level || 'beginner',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return {
      ...data,
      name: data.full_name,
    };
  },
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const updateData: any = { ...updates };
    if (updates.name) {
      updateData.full_name = updates.name;
      delete updateData.name;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return {
      ...data,
      name: data.full_name,
    };
  },

  async incrementGameStats(userId: string, completionTime: number): Promise<UserProfile | null> {
    // First get current stats
    const current = await this.getUserProfile(userId);
    if (!current) return null;

    // Update with incremented values
    const { data, error } = await supabase
      .from('profiles')
      .update({
        total_games_played: (current.total_games_played || 0) + 1,
        total_time_played: (current.total_time_played || 0) + completionTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing game stats:', error);
      return null;
    }

    return {
      ...data,
      name: data.full_name,
    };
  },
};

// Game Images Service
export const gameImageService = {
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

  async uploadImage(file: File, imageData: Omit<GameImage, 'id' | 'image_url' | 'thumbnail_url' | 'created_at' | 'updated_at'>): Promise<GameImage | null> {
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${imageData.topic}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath);

      // Create database record
      const { data, error } = await supabase
        .from('game_images')
        .insert({
          ...imageData,
          image_url: publicUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating image record:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  },

  async deleteImage(imageId: string): Promise<boolean> {
    try {
      // Get image data first to find the file path
      const { data: imageData, error: fetchError } = await supabase
        .from('game_images')
        .select('image_url')
        .eq('id', imageId)
        .single();

      if (fetchError || !imageData) {
        console.error('Error fetching image data:', fetchError);
        return false;
      }

      // Extract file path from URL
      const url = new URL(imageData.image_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get topic/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('game-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('game_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteImage:', error);
      return false;
    }
  },
};

// Game Session Service (using your existing 'game_progress' table)
export const gameSessionService = {
  async createSession(sessionData: {
    user_id: string;
    image_id: string;
    topic: 'history' | 'culture';
    difficulty: 2 | 3 | 4;
    level_id?: string;
  }): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_progress')
      .insert({
        user_id: sessionData.user_id,
        image_id: sessionData.image_id,
        topic: sessionData.topic,
        difficulty: sessionData.difficulty,
        level_id: sessionData.level_id || `${sessionData.topic}-${sessionData.difficulty}`,
        start_time: new Date().toISOString(),
        is_completed: false,
        moves_count: 0,
        hints_used: 0,
        score: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game session:', error);
      return null;
    }

    return data;
  },

  async updateSession(sessionId: string, updates: Partial<GameSession>): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_progress')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating game session:', error);
      return null;
    }

    return data;
  },

  async completeSession(sessionId: string, completionData: {
    completion_time: number;
    moves_count: number;
    hints_used: number;
    score?: number;
  }): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_progress')
      .update({
        end_time: new Date().toISOString(),
        completion_time: completionData.completion_time,
        time_taken: completionData.completion_time, // Your existing field
        is_completed: true,
        moves_count: completionData.moves_count,
        hints_used: completionData.hints_used,
        score: completionData.score || 0,
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

  async getUserSessions(userId: string, limit: number = 10): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return data || [];
  },
};

// Best Times Service
export const bestTimesService = {
  async getBestTimes(userId: string): Promise<{ [key: string]: number }> {
    const { data, error } = await supabase
      .from('user_best_times')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching best times:', error);
      return {};
    }

    const bestTimes: { [key: string]: number } = {};
    data?.forEach(record => {
      const key = `${record.image_id}-${record.topic}-${record.difficulty}`;
      bestTimes[key] = record.best_time;
    });

    return bestTimes;
  },
  async getBestTime(userId: string, imageId: string, topic: 'history' | 'culture', difficulty: 2 | 3 | 4): Promise<number | null> {
    const { data, error } = await supabase
      .from('user_best_times')
      .select('best_time')
      .eq('user_id', userId)
      .eq('image_id', imageId)
      .eq('topic', topic)
      .eq('difficulty', difficulty)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching best time:', error);
      }
      return null;
    }

    return data?.best_time || null;
  },

  async updateBestTime(
    userId: string,
    imageId: string,
    topic: 'history' | 'culture',
    difficulty: 2 | 3 | 4,
    bestTime: number,
    sessionId?: string
  ): Promise<UserBestTime | null> {
    const { data, error } = await supabase
      .from('user_best_times')
      .upsert({
        user_id: userId,
        image_id: imageId,
        topic,
        difficulty,
        best_time: bestTime,
        session_id: sessionId,
        achieved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating best time:', error);
      return null;
    }

    return data;
  },
};

// Campaign Progress Service
export const campaignProgressService = {
  async getCampaignProgress(userId: string): Promise<CampaignProgress[]> {
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

  async updateCampaignProgress(
    userId: string,
    campaignId: string,
    milestoneId: string,
    progressData: {
      difficulty: 2 | 3 | 4;
      completion_time: number;
      score: number;
    }
  ): Promise<CampaignProgress | null> {
    const { data, error } = await supabase
      .from('campaign_progress')
      .upsert({
        user_id: userId,
        campaign_id: campaignId,
        milestone_id: milestoneId,
        completed_at: new Date().toISOString(),
        difficulty: progressData.difficulty,
        completion_time: progressData.completion_time,
        score: progressData.score,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign progress:', error);
      return null;
    }

    return data;
  },
};

// Achievements Service
export const achievementsService = {
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  },

  async awardAchievement(
    userId: string,
    achievementType: string,
    achievementName: string,
    description: string,
    sessionId?: string,
    metadata?: any
  ): Promise<UserAchievement | null> {
    // Check if achievement already exists
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_type', achievementType)
      .single();

    if (existing) {
      return null; // Achievement already awarded
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description,
        session_id: sessionId,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }

    return data;
  },
};

// Admin Service
export const adminService = {
  // Check if current user is admin (simplified to avoid RPC calls)
  async isAdmin(userId?: string): Promise<boolean> {
    try {
      // Instead of using RPC, directly check the profiles table
      if (!userId) {
        const session = await supabase.auth.getSession();
        userId = session.data.session?.user?.id;
        if (!userId) return false;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking admin status through profiles:', error);
        return false;
      }
      
      return data?.role === 'admin' || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Check if user has specific admin permission (simplified)
  async hasPermission(permission: AdminPermission, userId?: string): Promise<boolean> {
    // For now, just check if they're an admin at all
    // This avoids the problematic RPC call
    return this.isAdmin(userId);
  },
  // Get user role from profiles
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      console.log('Fetching role for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      console.log('Role query result:', { data, error });
      
      if (error) {
        console.error('Database error getting user role:', error);
        return 'user';
      }
      
      if (!data) {
        console.log('No profile data found for user:', userId);
        return 'user';
      }
      
      const role = data.role || 'user';
      console.log('User role:', role);
      return role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  },

  // Set user role (admin only)
  async setUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const isCurrentUserAdmin = await this.isAdmin();
      if (!isCurrentUserAdmin) {
        throw new Error('Only admins can set user roles');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error setting user role:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error setting user role:', error);
      return false;
    }
  },

  // Get all admin users
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  },

  // Create admin user entry
  async createAdminUser(userId: string, role: 'admin' | 'moderator', permissions: AdminPermission[]): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role,
          permissions,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating admin user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return null;
    }
  }
};

// Utility functions
export const calculateScore = (completionTime: number, moves: number, hints: number, difficulty: number): number => {
  const baseScore = 1000 * difficulty;
  const timeBonus = Math.max(0, 300 - completionTime) * 2;
  const movesPenalty = Math.max(0, moves - 20) * 5;
  const hintsPenalty = hints * 50;
  
  return Math.max(100, baseScore + timeBonus - movesPenalty - hintsPenalty);
};

export const detectAchievements = async (sessionData: GameSession): Promise<string[]> => {
  if (!sessionData.is_completed || !sessionData.completion_time) return [];
  
  const achievements: string[] = [];
  
  // Speed achievements
  if (sessionData.completion_time < 60) {
    achievements.push('speed_demon');
  }
  
  // Efficiency achievements
  if (sessionData.moves_count < 50) {
    achievements.push('efficiency_expert');
  }
  
  // Perfect game (no hints)
  if (sessionData.hints_used === 0) {
    achievements.push('perfectionist');
  }
  
  return achievements;
};
