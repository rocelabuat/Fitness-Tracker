import { User, DailyActivity, ManualEntry, AuthUser } from '@/types/fitness';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users/');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}/`);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}/`, {
      method: 'DELETE',
    });
  }

  async getUserActivities(userId: number): Promise<DailyActivity[]> {
    return this.request<DailyActivity[]>(`/users/${userId}/activities/`);
  }

  async getUserRecentActivities(userId: number): Promise<DailyActivity[]> {
    return this.request<DailyActivity[]>(`/users/${userId}/recent/`);
  }

  // Daily Activity endpoints
  async getDailyActivities(params?: {
    user_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<DailyActivity[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/daily-activities/?${queryString}` : '/daily-activities/';
    
    return this.request<DailyActivity[]>(endpoint);
  }

  async createDailyActivity(activityData: {
    user: number;
    date: string;
    steps: number;
    distance: number;
    calories: number;
  }): Promise<DailyActivity> {
    return this.request<DailyActivity>('/daily-activities/', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async getDailyActivity(id: number): Promise<DailyActivity> {
    return this.request<DailyActivity>(`/daily-activities/${id}/`);
  }

  async updateDailyActivity(id: number, activityData: Partial<DailyActivity>): Promise<DailyActivity> {
    return this.request<DailyActivity>(`/daily-activities/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deleteDailyActivity(id: number): Promise<void> {
    return this.request<void>(`/daily-activities/${id}/`, {
      method: 'DELETE',
    });
  }

  async getDailyActivitiesByDateRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
    return this.request<DailyActivity[]>(`/daily-activities/by-date-range/?start_date=${startDate}&end_date=${endDate}`);
  }

  // Manual Entry endpoints
  async getManualEntries(params?: {
    daily_activity_id?: number;
    activity?: string;
    user_id?: number;
    activity_type?: string;
  }): Promise<ManualEntry[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/manual-entries/?${queryString}` : '/manual-entries/';
    
    return this.request<ManualEntry[]>(endpoint);
  }

  async createManualEntry(entryData: {
    daily_activity: number;
    activity: string;
    duration?: number;
    calories: number;
  }): Promise<ManualEntry> {
    return this.request<ManualEntry>('/manual-entries/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getManualEntry(id: number): Promise<ManualEntry> {
    return this.request<ManualEntry>(`/manual-entries/${id}/`);
  }

  async updateManualEntry(id: number, entryData: Partial<ManualEntry>): Promise<ManualEntry> {
    return this.request<ManualEntry>(`/manual-entries/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteManualEntry(id: number): Promise<void> {
    return this.request<void>(`/manual-entries/${id}/`, {
      method: 'DELETE',
    });
  }

  async getManualEntriesByUser(userId: number): Promise<ManualEntry[]> {
    return this.request<ManualEntry[]>(`/manual-entries/by-user/?user_id=${userId}`);
  }

  async getManualEntriesByActivityType(activityType: string): Promise<ManualEntry[]> {
    return this.request<ManualEntry[]>(`/manual-entries/by-activity-type/?activity_type=${activityType}`);
  }

  // Utility methods
  async getUsersByUsername(username: string): Promise<User[]> {
    return this.request<User[]>(`/users/?username=${encodeURIComponent(username)}`);
  }

  async getTodayActivity(userId: number): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    const activities = await this.getDailyActivities({
      user_id: userId,
      date: today,
    });
    return activities.length > 0 ? activities[0] : null;
  }

  async getOrCreateTodayActivity(userId: number): Promise<DailyActivity> {
    let activity = await this.getTodayActivity(userId);
    
    if (!activity) {
      activity = await this.createDailyActivity({
        user: userId,
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        distance: 0,
        calories: 0,
      });
    }
    
    return activity;
  }
}

export const apiService = new ApiService();
