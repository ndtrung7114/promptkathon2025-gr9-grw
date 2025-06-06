import { supabase } from '../supabase/client';
import { 
  DatabaseCampaign, 
  DatabaseMilestone, 
  UserCampaignProgress,
  Campaign,
  Milestone,
  convertDatabaseCampaign 
} from '../../types/campaigns';

// Re-export types for convenience
export type { Campaign, Milestone } from '../../types/campaigns';

class CampaignService {
  /**
   * Fetch all active campaigns with their milestones
   */
  async getCampaigns(category?: 'history' | 'culture'): Promise<Campaign[]> {
    try {
      // Build query for campaigns
      let campaignQuery = supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (category) {
        campaignQuery = campaignQuery.eq('category', category);
      }

      const { data: campaigns, error: campaignError } = await campaignQuery;

      if (campaignError) {
        console.error('Error fetching campaigns:', campaignError);
        throw campaignError;
      }

      if (!campaigns || campaigns.length === 0) {
        return [];
      }

      // Fetch all milestones for these campaigns
      const campaignIds = campaigns.map(c => c.id);
      const { data: milestones, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')
        .in('campaign_id', campaignIds)
        .eq('is_active', true)
        .order('display_order');

      if (milestoneError) {
        console.error('Error fetching milestones:', milestoneError);
        throw milestoneError;
      }

      // Convert and combine data
      return campaigns.map(campaign => 
        convertDatabaseCampaign(campaign as DatabaseCampaign, milestones as DatabaseMilestone[] || [])
      );

    } catch (error) {
      console.error('Error in getCampaigns:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific campaign by slug
   */
  async getCampaign(slug: string): Promise<Campaign | null> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching campaign:', campaignError);
        throw campaignError;
      }

      const { data: milestones, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('is_active', true)
        .order('display_order');

      if (milestoneError) {
        console.error('Error fetching milestones:', milestoneError);
        throw milestoneError;
      }

      return convertDatabaseCampaign(campaign as DatabaseCampaign, milestones as DatabaseMilestone[] || []);

    } catch (error) {
      console.error('Error in getCampaign:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific campaign by ID
   */
  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching campaign by ID:', campaignError);
        throw campaignError;
      }

      const { data: milestones, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('is_active', true)
        .order('display_order');

      if (milestoneError) {
        console.error('Error fetching milestones:', milestoneError);
        throw milestoneError;
      }

      return convertDatabaseCampaign(campaign as DatabaseCampaign, milestones as DatabaseMilestone[] || []);

    } catch (error) {
      console.error('Error in getCampaignById:', error);
      throw error;
    }
  }

  /**
   * Fetch featured campaigns
   */
  async getFeaturedCampaigns(): Promise<Campaign[]> {
    try {
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .eq('featured', true)
        .order('display_order');

      if (campaignError) {
        console.error('Error fetching featured campaigns:', campaignError);
        throw campaignError;
      }

      if (!campaigns || campaigns.length === 0) {
        return [];
      }

      const campaignIds = campaigns.map(c => c.id);
      const { data: milestones, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')
        .in('campaign_id', campaignIds)
        .eq('is_active', true)
        .order('display_order');

      if (milestoneError) {
        console.error('Error fetching milestones:', milestoneError);
        throw milestoneError;
      }

      return campaigns.map(campaign => 
        convertDatabaseCampaign(campaign as DatabaseCampaign, milestones as DatabaseMilestone[] || [])
      );

    } catch (error) {
      console.error('Error in getFeaturedCampaigns:', error);
      throw error;
    }
  }
  /**
   * Get user's completed milestones with difficulty tracking
   */
  async getCompletedMilestones(userId?: string): Promise<string[]> {
    // If no user ID, fall back to localStorage for backward compatibility
    if (!userId) {
      const completed = localStorage.getItem('vietnam-puzzle-completed-milestones');
      return completed ? JSON.parse(completed) : [];
    }

    try {
      const { data, error } = await supabase
        .from('user_milestone_progress')
        .select(`
          milestone_id,
          difficulty,
          milestones!inner (
            campaign_id,
            slug,
            campaigns!inner (
              slug
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching completed milestones:', error);
        throw error;
      }

      // Convert database milestone IDs back to the format expected by the frontend
      // Include difficulty in the ID format: campaignSlug-milestoneSlug-difficulty
      return (data || []).map(item => {
        const campaignSlug = (item.milestones as any).campaigns.slug;
        const milestoneSlug = (item.milestones as any).slug;
        const difficulty = item.difficulty;
        return `${campaignSlug}-${milestoneSlug}-${difficulty}`;
      });

    } catch (error) {
      console.error('Error in getCompletedMilestones:', error);
      // Fall back to localStorage on error
      const completed = localStorage.getItem('vietnam-puzzle-completed-milestones');
      return completed ? JSON.parse(completed) : [];
    }
  }

  /**
   * Get user's milestone progress with difficulty details
   */
  async getMilestoneProgress(userId?: string): Promise<{
    [milestoneId: string]: {
      [difficulty: number]: {
        completed: boolean;
        completionTime?: number;
        score?: number;
        movesCount?: number;
        hintsUsed?: number;
        completedAt?: string;
      }
    }
  }> {
    if (!userId) {
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('user_milestone_progress')
        .select(`
          difficulty,
          completion_time,
          score,
          moves_count,
          hints_used,
          completed_at,
          milestones!inner (
            slug,
            campaigns!inner (
              slug
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching milestone progress:', error);
        throw error;
      }

      const progress: any = {};
      (data || []).forEach(item => {
        const campaignSlug = (item.milestones as any).campaigns.slug;
        const milestoneSlug = (item.milestones as any).slug;
        const milestoneId = `${campaignSlug}-${milestoneSlug}`;
        
        if (!progress[milestoneId]) {
          progress[milestoneId] = {};
        }
        
        progress[milestoneId][item.difficulty] = {
          completed: true,
          completionTime: item.completion_time,
          score: item.score,
          movesCount: item.moves_count,
          hintsUsed: item.hints_used,
          completedAt: item.completed_at
        };
      });

      return progress;

    } catch (error) {
      console.error('Error in getMilestoneProgress:', error);
      return {};
    }
  }
  /**
   * Mark a milestone as completed for a user with difficulty tracking
   */
  async markMilestoneCompleted(
    milestoneId: string, 
    difficulty: 2 | 3,
    userId?: string, 
    completionTime?: number, 
    score?: number,
    movesCount?: number,
    hintsUsed?: number
  ): Promise<void> {
    // If no user ID, fall back to localStorage
    if (!userId) {
      const completed = localStorage.getItem('vietnam-puzzle-completed-milestones');
      const completedList = completed ? JSON.parse(completed) : [];
      const fullId = `${milestoneId}-${difficulty}`;
      if (!completedList.includes(fullId)) {
        completedList.push(fullId);
        localStorage.setItem('vietnam-puzzle-completed-milestones', JSON.stringify(completedList));
      }
      return;
    }

    try {
      // Parse the milestone ID to get campaign and milestone slugs
      const [campaignSlug, milestoneSlug] = milestoneId.split('-');
      
      if (!campaignSlug || !milestoneSlug) {
        throw new Error(`Invalid milestone ID format: ${milestoneId}`);
      }

      // Use the database function for marking completion
      const { data, error } = await supabase.rpc('mark_milestone_completed', {
        p_campaign_slug: campaignSlug,
        p_milestone_slug: milestoneSlug,
        p_difficulty: difficulty,
        p_completion_time: completionTime || null,
        p_score: score || 0,
        p_moves_count: movesCount || null,
        p_hints_used: hintsUsed || 0,
        p_user_id: userId
      });

      if (error) {
        console.error('Error saving milestone progress:', error);
        throw error;
      }

    } catch (error) {
      console.error('Error in markMilestoneCompleted:', error);
      // Fall back to localStorage on error
      const completed = localStorage.getItem('vietnam-puzzle-completed-milestones');
      const completedList = completed ? JSON.parse(completed) : [];
      const fullId = `${milestoneId}-${difficulty}`;
      if (!completedList.includes(fullId)) {
        completedList.push(fullId);
        localStorage.setItem('vietnam-puzzle-completed-milestones', JSON.stringify(completedList));
      }
    }
  }

  /**
   * Get campaign progress for a user
   */
  async getCampaignProgress(
    campaign: Campaign, 
    userId?: string
  ): Promise<{ completed: number; total: number }> {
    const completedMilestones = await this.getCompletedMilestones(userId);
    const completed = campaign.milestones.filter(m => 
      completedMilestones.includes(m.id)
    ).length;
    
    return { completed, total: campaign.milestones.length };
  }

  /**
   * Get detailed user progress for a campaign
   */
  async getUserCampaignProgress(
    campaignSlug: string, 
    userId: string
  ): Promise<UserCampaignProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_campaign_progress')
        .select(`
          *,
          campaigns!inner (slug),
          milestones!inner (slug)
        `)
        .eq('user_id', userId)
        .eq('campaigns.slug', campaignSlug);

      if (error) {
        console.error('Error fetching user campaign progress:', error);
        throw error;
      }

      return data as UserCampaignProgress[] || [];

    } catch (error) {
      console.error('Error in getUserCampaignProgress:', error);
      return [];
    }
  }
}

// Export singleton instance
export const campaignService = new CampaignService();

// Export individual functions for backward compatibility
export const getCampaigns = (category?: 'history' | 'culture') => 
  campaignService.getCampaigns(category);

export const getCampaign = (slug: string) => 
  campaignService.getCampaign(slug);

export const getCampaignById = (id: string) => 
  campaignService.getCampaignById(id);

export const getCompletedMilestones = (userId?: string) => 
  campaignService.getCompletedMilestones(userId);

export const getMilestoneProgress = (userId?: string) => 
  campaignService.getMilestoneProgress(userId);

export const markMilestoneCompleted = (
  milestoneId: string, 
  difficulty: 2 | 3,
  userId?: string, 
  completionTime?: number, 
  score?: number,
  movesCount?: number,
  hintsUsed?: number
) => campaignService.markMilestoneCompleted(milestoneId, difficulty, userId, completionTime, score, movesCount, hintsUsed);

export const getCampaignProgress = (campaign: Campaign, userId?: string) => 
  campaignService.getCampaignProgress(campaign, userId);
