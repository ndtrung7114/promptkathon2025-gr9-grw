import { supabase } from './client';

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
  audio_url: string | null;
  milestone_id: string | null;
}

export const milestoneImageService = {  /**
   * Get all images for a specific milestone
   */
  async getImagesByMilestoneId(milestoneId: string): Promise<GameImage[]> {
    console.log(`[DEBUG] Querying game_images for milestone_id: ${milestoneId}`);
    
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('milestone_id', milestoneId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images by milestone ID:', error);
      return [];
    }

    console.log(`[DEBUG] Database query returned ${data?.length || 0} rows for milestone ${milestoneId}`);
    if (data && data.length > 0) {
      console.log('[DEBUG] Query results:', data.map(img => ({ id: img.id, title: img.title, milestone_id: img.milestone_id })));
    }

    return data || [];
  },
  /**
   * Get a random image for a specific milestone
   */
  async getRandomImageByMilestoneId(milestoneId: string): Promise<GameImage | null> {
    console.log(`[DEBUG] Getting random image for milestone: ${milestoneId}`);
    const images = await this.getImagesByMilestoneId(milestoneId);
    
    console.log(`[DEBUG] Found ${images.length} images for milestone ${milestoneId}`);
    if (images.length > 0) {
      console.log('[DEBUG] Available images:', images.map(img => ({ id: img.id, title: img.title, url: img.image_url })));
    }
    
    if (images.length === 0) {
      console.warn(`No images found for milestone: ${milestoneId}`);
      return null;
    }

    // Return a random image from the available images
    const randomIndex = Math.floor(Math.random() * images.length);
    const selectedImage = images[randomIndex];
    console.log(`[DEBUG] Selected random image:`, { id: selectedImage.id, title: selectedImage.title, url: selectedImage.image_url });
    return selectedImage;
  },
  /**
   * Get images by campaign ID (through milestones)
   */
  async getImagesByCampaignId(campaignId: string): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select(`
        *,
        milestones!inner (
          campaign_id
        )
      `)
      .eq('milestones.campaign_id', campaignId)
      .eq('is_active', true)
      .not('milestone_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images by campaign ID:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all active game images
   */
  async getAllActiveImages(): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all active images:', error);
      return [];
    }

    return data || [];
  },
  /**
   * Get images by topic - only those with valid milestone_id
   */
  async getImagesByTopic(topic: 'history' | 'culture'): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('topic', topic)
      .eq('is_active', true)
      .not('milestone_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images by topic:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get images by topic - including those without milestone_id (for general use)
   */
  async getImagesByTopicAll(topic: 'history' | 'culture'): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('topic', topic)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all images by topic:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all images that have valid milestone_id
   */
  async getImagesWithMilestones(): Promise<GameImage[]> {
    const { data, error } = await supabase
      .from('game_images')
      .select('*')
      .eq('is_active', true)
      .not('milestone_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images with milestones:', error);
      return [];
    }

    return data || [];
  }
};