const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Mission {
  id: string;
  code: string;
  type: string;
  tier: number;
  title: string;
  description: string;
  requirement: {
    count: number;
    threshold?: number;
  };
  reward: {
    points: number;
    badge: string;
  };
  isActive: boolean;
  progress?: {
    current: number;
    required: number;
    isCompleted: boolean;
    percentage: number;
    completedAt?: string | null;
  };
}

export interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  hasActivityToday: boolean;
  lastActivityDate: string | null;
}

export const missionsService = {
  /**
   * Get all missions with user progress
   */
  async getMissions(): Promise<{ missions: Mission[]; stats: MissionStats }> {
    const response = await fetch(`${API_BASE_URL}/api/missions`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch missions');
    }

    return response.json();
  },

  /**
   * Get mission statistics
   */
  async getStats(): Promise<MissionStats> {
    const response = await fetch(`${API_BASE_URL}/api/missions/stats`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mission stats');
    }

    return response.json();
  },

  /**
   * Get streak information
   */
  async getStreak(): Promise<StreakInfo> {
    const response = await fetch(`${API_BASE_URL}/api/missions/streak`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streak info');
    }

    return response.json();
  },

  /**
   * Get missions by type
   */
  async getMissionsByType(type: string): Promise<{ missions: Mission[] }> {
    const response = await fetch(`${API_BASE_URL}/api/missions/type/${type}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch missions by type');
    }

    return response.json();
  },

  /**
   * Get specific mission by ID
   */
  async getMissionById(missionId: string): Promise<{ mission: Mission }> {
    const response = await fetch(`${API_BASE_URL}/api/missions/${missionId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mission');
    }

    return response.json();
  },
};
