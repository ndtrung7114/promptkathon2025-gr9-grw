export interface Milestone {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl?: string; // Optional audio narration URL
  order: number;
}

export interface Campaign {
  id: string;
  title: string;
  period: string;
  description: string;
  imageUrl: string;
  milestones: Milestone[];
  order: number;
}

export const historicalCampaigns: Campaign[] = [
  {
    id: 'trung-sisters',
    title: "Trưng Sisters' Uprising",
    period: '40-43 AD',
    description: 'The first major rebellion against Chinese domination, led by the legendary Trưng sisters.',
    imageUrl: '/placeholder.svg',
    order: 1,
    milestones: [
      {
        id: 'trung-sisters-1',
        title: 'The Call to Arms',
        description: 'Trưng Trắc and Trưng Nhị rally the Vietnamese people against Chinese oppression.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/trung-sisters-1-call-to-arms.mp3',
        order: 1
      },
      {
        id: 'trung-sisters-2',
        title: 'Victory at Mê Linh',
        description: 'The sisters lead their forces to victory, establishing an independent kingdom.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/trung-sisters-2-victory-me-linh.mp3',
        order: 2
      },
      {
        id: 'trung-sisters-3',
        title: 'The Final Stand',
        description: 'The heroic last battle and sacrifice of the Trưng sisters for Vietnamese independence.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/trung-sisters-3-final-stand.mp3',
        order: 3
      }
    ]
  },
  {
    id: 'bach-dang',
    title: "Ngô Quyền's Victory at Bạch Đằng",
    period: '938 AD',
    description: 'The decisive naval battle that ended Chinese domination and established Vietnamese independence.',
    imageUrl: '/placeholder.svg',
    order: 2,
    milestones: [
      {
        id: 'bach-dang-1',
        title: 'The Southern Han Invasion',
        description: 'Chinese forces launch a massive naval invasion through the Bạch Đằng River.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/bach-dang-1-han-invasion.mp3',
        order: 1
      },
      {
        id: 'bach-dang-2',
        title: 'The Clever Trap',
        description: 'Ngô Quyền strategically places iron-tipped stakes beneath the river surface.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/bach-dang-2-clever-trap.mp3',
        order: 2
      },
      {
        id: 'bach-dang-3',
        title: 'Victory and Independence',
        description: 'The Chinese fleet is destroyed, securing Vietnamese independence for centuries.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/bach-dang-3-victory-independence.mp3',
        order: 3
      }
    ]
  },
  {
    id: 'mongol-invasions',
    title: 'Trần Dynasty & Mongol Invasions',
    period: '1225-1400 AD',
    description: 'Three heroic defenses against the mighty Mongol Empire under the Trần dynasty.',
    imageUrl: '/placeholder.svg',
    order: 3,
    milestones: [
      {
        id: 'mongol-1',
        title: 'First Mongol Invasion',
        description: 'Trần Thủ Độ leads the defense against the first Mongol assault in 1258.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/mongol-1-first-invasion.mp3',
        order: 1
      },
      {
        id: 'mongol-2',
        title: 'Second Mongol Invasion',
        description: 'Trần Hưng Đạo defeats a larger Mongol force in 1285.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/mongol-2-second-invasion.mp3',
        order: 2
      },
      {
        id: 'mongol-3',
        title: 'Third Victory at Bạch Đằng',
        description: 'The final defeat of Mongol naval forces using the famous stake trap strategy.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/mongol-3-third-victory.mp3',
        order: 3
      }
    ]
  },
  {
    id: 'lam-son',
    title: 'Lam Sơn Uprising',
    period: '1418-1428 AD',
    description: 'Lê Lợi leads a peasant rebellion to expel Chinese Ming occupation.',
    imageUrl: '/placeholder.svg',
    order: 4,
    milestones: [
      {
        id: 'lam-son-1',
        title: 'The Uprising Begins',
        description: 'Lê Lợi starts the rebellion from his home base in Lam Sơn.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/lam-son-1-uprising-begins.mp3',
        order: 1
      },
      {
        id: 'lam-son-2',
        title: 'Guerrilla Warfare',
        description: 'Vietnamese forces use innovative guerrilla tactics against Ming armies.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/lam-son-2-guerrilla-warfare.mp3',
        order: 2
      },
      {
        id: 'lam-son-3',
        title: 'Victory and the Lê Dynasty',
        description: 'Final expulsion of Chinese forces and establishment of the Lê dynasty.',
        imageUrl: '/placeholder.svg',
        audioUrl: '/assets/audio/lam-son-3-le-dynasty.mp3',
        order: 3
      }
    ]
  }
];

export const getCompletedMilestones = (): string[] => {
  const completed = localStorage.getItem('vietnam-puzzle-completed-milestones');
  return completed ? JSON.parse(completed) : [];
};

export const markMilestoneCompleted = (milestoneId: string): void => {
  const completed = getCompletedMilestones();
  if (!completed.includes(milestoneId)) {
    completed.push(milestoneId);
    localStorage.setItem('vietnam-puzzle-completed-milestones', JSON.stringify(completed));
  }
};

export const getCampaignProgress = (campaign: Campaign): { completed: number; total: number } => {
  const completedMilestones = getCompletedMilestones();
  const completed = campaign.milestones.filter(m => completedMilestones.includes(m.id)).length;
  return { completed, total: campaign.milestones.length };
};

export const getCampaignById = (campaignId: string): Campaign | null => {
  return historicalCampaigns.find(campaign => campaign.id === campaignId) || null;
};

export const getMilestoneById = (milestoneId: string): Milestone | null => {
  for (const campaign of historicalCampaigns) {
    const milestone = campaign.milestones.find(m => m.id === milestoneId);
    if (milestone) return milestone;
  }
  return null;
};
