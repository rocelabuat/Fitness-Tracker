import { User, DailyActivity, ManualEntry, AuthUser, LoginRequest } from '@/types/fitness';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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

  // Authentication (explicit absolute URL per requirement)
  async authenticateUser(loginData: LoginRequest): Promise<User> {
    const url = 'http://127.0.0.1:8000/api/login/';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/add-user/');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/add-user/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/update-user/${id}/`);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/update-user/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async getWeeklyActivity(userId: number): Promise<{ average_steps: number; average_distance: number; average_calories: number; total_calories: number; }> {
    return this.request(`/weekly-activity/${userId}/`);
  }

  // Daily Activity endpoints
  async getDailyActivities(): Promise<DailyActivity[]> {
    return this.request<DailyActivity[]>('/daily-activity/');
  }

  async createDailyActivity(activityData: {
    user: number;
    date: string;
    steps: number;
    distance: number;
    calories: number;
  }): Promise<DailyActivity> {
    return this.request<DailyActivity>('/daily-activity/', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async getDailyActivity(id: number): Promise<DailyActivity> {
    return this.request<DailyActivity>(`/daily-activity/${id}/`);
  }

  async updateDailyActivity(id: number, activityData: Partial<DailyActivity>): Promise<DailyActivity> {
    return this.request<DailyActivity>(`/daily-activity/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(activityData),
    });
  }

  async deleteDailyActivity(id: number): Promise<void> {
    return this.request<void>(`/daily-activity/${id}/`, {
      method: 'DELETE',
    });
  }

  async getDailyActivitiesByUser(userId: number): Promise<DailyActivity[]> {
    return this.request<DailyActivity[]>(`/daily-activity/user/${userId}/`);
  }

  async getDailyActivitiesByDateRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
    // For now, get all activities and filter on the frontend
    // In a real app, you'd want a backend endpoint for date range filtering
    const activities = await this.getDailyActivities();
    return activities.filter(activity => 
      activity.date >= startDate && activity.date <= endDate
    );
  }

  // Manual Entry endpoints
  async getManualEntries(): Promise<ManualEntry[]> {
    return this.request<ManualEntry[]>('/manual-entry/');
  }

  async createManualEntry(entryData: {
    user: number;
    date: string;
    activity: string;
    duration?: number;
    calories: number;
  }): Promise<ManualEntry> {
    return this.request<ManualEntry>('/manual-entry/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getManualEntry(id: number): Promise<ManualEntry> {
    return this.request<ManualEntry>(`/manual-entry/${id}/`);
  }

  async updateManualEntry(id: number, entryData: Partial<ManualEntry>): Promise<ManualEntry> {
    return this.request<ManualEntry>(`/manual-entry/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(entryData),
    });
  }

  async deleteManualEntry(id: number): Promise<void> {
    return this.request<void>(`/manual-entry/${id}/`, {
      method: 'DELETE',
    });
  }

  async getManualEntriesByUser(userId: number): Promise<ManualEntry[]> {
    return this.request<ManualEntry[]>(`/manual-entry/user/${userId}/`);
  }

  // Helpers adapted to current backend
  async getTodayActivity(userId: number): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    const activities = await this.getDailyActivitiesByUser(userId);
    const todayActivity = activities.find(a => a.date === today) || null;
    return todayActivity;
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

  async clearUserHistory(userId: number): Promise<void> {
    await this.request<void>(`/delete-activity/${userId}/`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
