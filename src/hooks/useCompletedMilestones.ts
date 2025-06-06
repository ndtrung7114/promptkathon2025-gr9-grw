import { useState, useEffect } from 'react';
import { getCompletedMilestones } from '../lib/supabase/gameProgressService';
import { useUser } from '../contexts/UserContext';

export interface UseCompletedMilestonesResult {
  completedMilestones: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCompletedMilestones = (): UseCompletedMilestonesResult => {
  const { user } = useUser();
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletedMilestones = async () => {
    if (!user?.id) {
      setCompletedMilestones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const milestones = await getCompletedMilestones(user.id);
      setCompletedMilestones(milestones);
    } catch (err) {
      console.error('Error fetching completed milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completed milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedMilestones();
  }, [user?.id]);

  return {
    completedMilestones,
    loading,
    error,
    refetch: fetchCompletedMilestones
  };
};

export default useCompletedMilestones;
