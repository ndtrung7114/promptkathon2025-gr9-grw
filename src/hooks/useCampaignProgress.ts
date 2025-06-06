import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '../types/campaigns';
import { getCompletedMilestones } from '../lib/supabase/gameProgressService';
import { useUser } from '../contexts/UserContext';

export interface CampaignProgressData {
  completed: number;
  total: number;
}

export interface UseCampaignProgressResult {
  getProgress: (campaign: Campaign) => CampaignProgressData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCampaignProgress = (): UseCampaignProgressResult => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressCache, setProgressCache] = useState<Record<string, CampaignProgressData>>({});
  const [loadingCampaigns, setLoadingCampaigns] = useState<Set<string>>(new Set());

  const fetchProgressForCampaign = useCallback(async (campaign: Campaign): Promise<CampaignProgressData> => {
    if (!user?.id) {
      return { completed: 0, total: campaign.milestones.length };
    }

    // Check cache first
    if (progressCache[campaign.id]) {
      return progressCache[campaign.id];
    }

    // Check if already loading this campaign
    if (loadingCampaigns.has(campaign.id)) {
      return { completed: 0, total: campaign.milestones.length };
    }    try {
      setLoadingCampaigns(prev => new Set(prev).add(campaign.id));
      
      // Get completed milestones from the database
      const completedMilestones = await getCompletedMilestones(user.id);
      
      // Calculate progress by counting completed milestones for this campaign
      const completed = campaign.milestones.filter(milestone => 
        completedMilestones.includes(milestone.id)
      ).length;
      
      const progress = { completed, total: campaign.milestones.length };
      
      // Cache the result
      setProgressCache(prev => ({
        ...prev,
        [campaign.id]: progress
      }));
      
      return progress;
    } catch (err) {
      console.error('Error getting campaign progress:', err);
      return { completed: 0, total: campaign.milestones.length };
    } finally {
      setLoadingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaign.id);
        return newSet;
      });
    }
  }, [user?.id, progressCache, loadingCampaigns]);

  const getProgress = useCallback((campaign: Campaign): CampaignProgressData => {
    if (!user?.id) {
      return { completed: 0, total: campaign.milestones.length };
    }

    // Check cache first
    if (progressCache[campaign.id]) {
      return progressCache[campaign.id];
    }

    // Start async fetch in background if not already loading
    if (!loadingCampaigns.has(campaign.id)) {
      fetchProgressForCampaign(campaign);
    }

    // Return default while loading
    return { completed: 0, total: campaign.milestones.length };
  }, [user?.id, progressCache, loadingCampaigns, fetchProgressForCampaign]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      // Clear cache to force refresh
      setProgressCache({});
    } catch (err) {
      console.error('Error fetching campaign progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProgress();
    }
  }, [user?.id]);

  return {
    getProgress,
    loading,
    error,
    refetch: fetchProgress
  };
};

export default useCampaignProgress;
