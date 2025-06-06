import { supabase } from './client';

export interface GameProgress {
  id: string;
  user_id: string;
  level_id: string; // Changed from milestone_id to level_id to match existing table
  difficulty: number;
  is_completed: boolean;
  completion_time?: number;
  score?: number;
  moves_count?: number;
  hints_used?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

class GameProgressService {
  /**
   * Mark a milestone as completed for a user
   */
  async markMilestoneCompleted(
    userId: string,
    milestoneId: string,
    difficulty: 2 | 3,
    completionTime?: number,
    score?: number,
    movesCount?: number,
    hintsUsed?: number
  ): Promise<void> {
    try {      // Check if progress already exists
      const { data: existing, error: fetchError } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('level_id', milestoneId)
        .eq('difficulty', difficulty)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing progress:', fetchError);
        throw fetchError;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('game_progress')
          .update({
            is_completed: true,
            completion_time: completionTime,
            score: score || 0,
            moves_count: movesCount,
            hints_used: hintsUsed || 0,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating game progress:', updateError);
          throw updateError;
        }
      } else {        // Create new record
        const { error: insertError } = await supabase
          .from('game_progress')
          .insert({
            user_id: userId,
            level_id: milestoneId,
            difficulty: difficulty,
            is_completed: true,
            completion_time: completionTime,
            score: score || 0,
            moves_count: movesCount,
            hints_used: hintsUsed || 0,
            completed_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting game progress:', insertError);
          throw insertError;
        }
      }

      console.log(`Milestone ${milestoneId} marked as completed for user ${userId} at difficulty ${difficulty}`);
    } catch (error) {
      console.error('Error in markMilestoneCompleted:', error);
      throw error;
    }
  }

  /**
   * Get completed milestones for a user
   */  async getCompletedMilestones(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('level_id')
        .eq('user_id', userId)
        .eq('is_completed', true);

      if (error) {
        console.error('Error fetching completed milestones:', error);
        throw error;
      }

      // Return unique milestone IDs
      const uniqueMilestoneIds = [...new Set((data || []).map(item => item.level_id))];
      console.log(`Found ${uniqueMilestoneIds.length} completed milestones for user ${userId}:`, uniqueMilestoneIds);
      return uniqueMilestoneIds;
    } catch (error) {
      console.error('Error in getCompletedMilestones:', error);
      throw error;
    }
  }

  /**
   * Get detailed progress for a specific milestone and difficulty
   */  async getMilestoneProgress(
    userId: string,
    milestoneId: string,
    difficulty: 2 | 3
  ): Promise<GameProgress | null> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('level_id', milestoneId)
        .eq('difficulty', difficulty)
        .maybeSingle();

      if (error) {
        console.error('Error fetching milestone progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getMilestoneProgress:', error);
      throw error;
    }
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(userId: string): Promise<GameProgress[]> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user progress:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      throw error;
    }
  }

  /**
   * Check if a milestone is completed for a user
   */  async isMilestoneCompleted(userId: string, milestoneId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('level_id', milestoneId)
        .eq('is_completed', true)
        .limit(1);

      if (error) {
        console.error('Error checking milestone completion:', error);
        throw error;
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Error in isMilestoneCompleted:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gameProgressService = new GameProgressService();

// Export individual functions for convenience
export const markMilestoneCompleted = (
  userId: string,
  milestoneId: string,
  difficulty: 2 | 3,
  completionTime?: number,
  score?: number,
  movesCount?: number,
  hintsUsed?: number
) => gameProgressService.markMilestoneCompleted(userId, milestoneId, difficulty, completionTime, score, movesCount, hintsUsed);

export const getCompletedMilestones = (userId: string) => 
  gameProgressService.getCompletedMilestones(userId);

export const getMilestoneProgress = (userId: string, milestoneId: string, difficulty: 2 | 3) =>
  gameProgressService.getMilestoneProgress(userId, milestoneId, difficulty);

export const getUserProgress = (userId: string) =>
  gameProgressService.getUserProgress(userId);

export const isMilestoneCompleted = (userId: string, milestoneId: string) =>
  gameProgressService.isMilestoneCompleted(userId, milestoneId);
