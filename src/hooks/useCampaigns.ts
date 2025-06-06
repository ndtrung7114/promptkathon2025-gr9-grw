import { useState, useEffect } from 'react';
import { Campaign } from '../types/campaigns';
import { getCampaigns } from '../lib/supabase/campaignService';

export interface UseCampaignsResult {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCampaigns = (category?: 'history' | 'culture'): UseCampaignsResult => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaigns(category);
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [category]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns
  };
};

export default useCampaigns;