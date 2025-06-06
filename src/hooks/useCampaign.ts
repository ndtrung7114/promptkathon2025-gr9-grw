import { useState, useEffect } from 'react';
import { Campaign } from '../types/campaigns';
import { getCampaignById } from '../lib/supabase/campaignService';

export interface UseCampaignResult {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCampaign = (campaignId: string): UseCampaignResult => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!campaignId) {
      setCampaign(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign
  };
};

export default useCampaign;
