// Database types that match our Supabase schema
export interface DatabaseCampaign {
  id: string;
  slug: string;
  title: string;
  period: string;
  description: string;
  image_url: string;
  thumbnail_url?: string;
  display_order: number;
  category: 'history' | 'culture';
  tags?: string[];
  location?: string;
  historical_significance?: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface DatabaseMilestone {
  id: string;
  campaign_id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url?: string;
  display_order: number;
  historical_date?: string;
  location?: string;
  participants?: string[];
  outcome?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface UserCampaignProgress {
  id: string;
  user_id: string;
  campaign_id: string;
  milestone_id: string;
  completed_at: string;
  completion_time?: number;
  score?: number;
  notes?: string;
  created_at: string;
}

// Keep existing interfaces for backward compatibility
export interface Milestone {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  // Additional fields from database
  slug?: string;
  historicalDate?: string;
  location?: string;
  participants?: string[];
  outcome?: string;
}

export interface Campaign {
  id: string;
  title: string;
  period: string;
  description: string;
  imageUrl: string;
  milestones: Milestone[];
  order: number;
  // Additional fields from database
  slug?: string;
  category?: 'history' | 'culture';
  tags?: string[];
  location?: string;
  historicalSignificance?: string;
  featured?: boolean;
}

// Conversion functions between database and client types
export function convertDatabaseCampaign(
  dbCampaign: DatabaseCampaign, 
  dbMilestones: DatabaseMilestone[]
): Campaign {
  const milestones = dbMilestones
    .filter(m => m.campaign_id === dbCampaign.id && m.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map(convertDatabaseMilestone);
  return {
    id: dbCampaign.id, // Use actual database ID
    title: dbCampaign.title,
    period: dbCampaign.period,
    description: dbCampaign.description,
    imageUrl: dbCampaign.image_url,
    milestones,
    order: dbCampaign.display_order,
    slug: dbCampaign.slug,
    category: dbCampaign.category,
    tags: dbCampaign.tags,
    location: dbCampaign.location,
    historicalSignificance: dbCampaign.historical_significance,
    featured: dbCampaign.featured
  };
}

export function convertDatabaseMilestone(dbMilestone: DatabaseMilestone): Milestone {
  return {
    id: dbMilestone.id, // Use actual database ID
    title: dbMilestone.title,
    description: dbMilestone.description,
    imageUrl: dbMilestone.image_url,
    order: dbMilestone.display_order,
    slug: dbMilestone.slug,
    historicalDate: dbMilestone.historical_date,
    location: dbMilestone.location,
    participants: dbMilestone.participants,
    outcome: dbMilestone.outcome
  };
}
