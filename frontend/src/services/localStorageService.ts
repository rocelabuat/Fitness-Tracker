import { 
  User, 
  DailyActivity, 
  ManualEntry, 
  CreateUserRequest,
  CreateDailyActivityRequest,
  CreateManualEntryRequest,
  UpdateUserRequest,
  UpdateDailyActivityRequest,
  UpdateManualEntryRequest,
  LoginRequest
} from '@/types/fitness';

class LocalStorageService {
  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper methods for localStorage operations
  private getStorageKey(key: string): string {
    return `fitness_tracker_${key}`;
  }

  private getData<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private setData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    await this.delay();
    return this.getData<User[]>('users', []);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    await this.delay();
    
    const users = await this.getUsers();
    
    // Check if username already exists
    const existingUser = users.find(u => u.username === userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Generate new user ID
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newUser: User = {
      id: maxId + 1,
      username: userData.username,
      password: userData.password || "",
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      gender: userData.gender,
      weight: userData.weight,
      height: userData.height,
      age: userData.age,
      step_goal: userData.step_goal || 10000
    };

    users.push(newUser);
    this.setData('users', users);
    return newUser;
  }

  async getUser(id: number): Promise<User> {
    await this.delay();
    const users = await this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    await this.delay();
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    users[userIndex] = { ...users[userIndex], ...userData };
    this.setData('users', users);
    return users[userIndex];
  }

  async deleteUser(id: number): Promise<void> {
    await this.delay();
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    users.splice(userIndex, 1);
    this.setData('users', users);
  }

  async getUsersByUsername(username: string): Promise<User[]> {
    await this.delay();
    const users = await this.getUsers();
    return users.filter(u => u.username === username);
  }

  // Authentication
  async authenticateUser(loginData: LoginRequest): Promise<User> {
    await this.delay();
    const users = await this.getUsers();
    const user = users.find(u => u.username === loginData.username);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.password !== loginData.password) {
      throw new Error("Invalid password");
    }
    return user;
  }

  // Daily Activity endpoints
  async getDailyActivities(params?: {
    user_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<DailyActivity[]> {
    await this.delay();
    
    let activities = this.getData<DailyActivity[]>('daily_activities', []);
    
    if (params?.user_id) {
      activities = activities.filter(a => a.user === params.user_id);
    }
    
    if (params?.date) {
      activities = activities.filter(a => a.date === params.date);
    }
    
    if (params?.start_date && params?.end_date) {
      activities = activities.filter(a => a.date >= params.start_date! && a.date <= params.end_date!);
    }
    
    return activities;
  }

  async createDailyActivity(activityData: CreateDailyActivityRequest): Promise<DailyActivity> {
    await this.delay();
    
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const maxId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) : 0;
    
    const newActivity: DailyActivity = {
      id: maxId + 1,
      user: activityData.user,
      date: activityData.date,
      steps: activityData.steps,
      distance: activityData.distance,
      calories: activityData.calories,
      manual_entries: []
    };

    activities.push(newActivity);
    this.setData('daily_activities', activities);
    return newActivity;
  }

  async getDailyActivity(id: number): Promise<DailyActivity> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const activity = activities.find(a => a.id === id);
    if (!activity) {
      throw new Error("Daily activity not found");
    }
    return activity;
  }

  async updateDailyActivity(id: number, activityData: UpdateDailyActivityRequest): Promise<DailyActivity> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
      throw new Error("Daily activity not found");
    }

    activities[activityIndex] = { ...activities[activityIndex], ...activityData };
    this.setData('daily_activities', activities);
    return activities[activityIndex];
  }

  async deleteDailyActivity(id: number): Promise<void> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
      throw new Error("Daily activity not found");
    }
    activities.splice(activityIndex, 1);
    this.setData('daily_activities', activities);
  }

  async getDailyActivitiesByDateRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    return activities.filter(a => a.date >= startDate && a.date <= endDate);
  }

  async getTodayActivity(userId: number): Promise<DailyActivity | null> {
    await this.delay();
    const today = new Date().toISOString().split('T')[0];
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const activity = activities.find(a => a.user === userId && a.date === today);
    return activity || null;
  }

  async getOrCreateTodayActivity(userId: number): Promise<DailyActivity> {
    await this.delay();
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

  // Manual Entry endpoints
  async getManualEntries(params?: {
    daily_activity_id?: number;
    activity?: string;
    user_id?: number;
    activity_type?: string;
  }): Promise<ManualEntry[]> {
    await this.delay();
    
    let entries = this.getData<ManualEntry[]>('manual_entries', []);
    
    if (params?.daily_activity_id) {
      entries = entries.filter(e => e.daily_activity === params.daily_activity_id);
    }
    
    if (params?.activity) {
      entries = entries.filter(e => e.activity.toLowerCase().includes(params.activity!.toLowerCase()));
    }
    
    return entries;
  }

  async createManualEntry(entryData: CreateManualEntryRequest): Promise<ManualEntry> {
    await this.delay();
    
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    const maxId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) : 0;
    
    const newEntry: ManualEntry = {
      id: maxId + 1,
      daily_activity: entryData.daily_activity,
      activity: entryData.activity,
      duration: entryData.duration,
      calories: entryData.calories
    };

    entries.push(newEntry);
    this.setData('manual_entries', entries);
    
    // Update the daily activity to include this entry
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const activity = activities.find(a => a.id === entryData.daily_activity);
    if (activity) {
      activity.manual_entries = entries.filter(e => e.daily_activity === activity.id);
      this.setData('daily_activities', activities);
    }
    
    return newEntry;
  }

  async getManualEntry(id: number): Promise<ManualEntry> {
    await this.delay();
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    const entry = entries.find(e => e.id === id);
    if (!entry) {
      throw new Error("Manual entry not found");
    }
    return entry;
  }

  async updateManualEntry(id: number, entryData: UpdateManualEntryRequest): Promise<ManualEntry> {
    await this.delay();
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    const entryIndex = entries.findIndex(e => e.id === id);
    if (entryIndex === -1) {
      throw new Error("Manual entry not found");
    }

    entries[entryIndex] = { ...entries[entryIndex], ...entryData };
    this.setData('manual_entries', entries);
    return entries[entryIndex];
  }

  async deleteManualEntry(id: number): Promise<void> {
    await this.delay();
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    const entryIndex = entries.findIndex(e => e.id === id);
    if (entryIndex === -1) {
      throw new Error("Manual entry not found");
    }
    entries.splice(entryIndex, 1);
    this.setData('manual_entries', entries);
  }

  async getManualEntriesByUser(userId: number): Promise<ManualEntry[]> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const userActivities = activities.filter(a => a.user === userId);
    const activityIds = userActivities.map(a => a.id);
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    return entries.filter(e => activityIds.includes(e.daily_activity));
  }

  async getManualEntriesByActivityType(activityType: string): Promise<ManualEntry[]> {
    await this.delay();
    const entries = this.getData<ManualEntry[]>('manual_entries', []);
    return entries.filter(e => e.activity.toLowerCase().includes(activityType.toLowerCase()));
  }

  // Utility methods
  async getUserActivities(userId: number): Promise<DailyActivity[]> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    return activities.filter(a => a.user === userId);
  }

  async getUserRecentActivities(userId: number): Promise<DailyActivity[]> {
    await this.delay();
    const activities = this.getData<DailyActivity[]>('daily_activities', []);
    const userActivities = activities.filter(a => a.user === userId);
    return userActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  }

  // Data management methods
  clearAllData(): void {
    const keys = ['users', 'daily_activities', 'manual_entries'];
    keys.forEach(key => {
      localStorage.removeItem(this.getStorageKey(key));
    });
    localStorage.removeItem('currentUserId');
  }

  exportData(): { users: User[], dailyActivities: DailyActivity[], manualEntries: ManualEntry[] } {
    return {
      users: this.getData<User[]>('users', []),
      dailyActivities: this.getData<DailyActivity[]>('daily_activities', []),
      manualEntries: this.getData<ManualEntry[]>('manual_entries', [])
    };
  }

  importData(data: { users: User[], dailyActivities: DailyActivity[], manualEntries: ManualEntry[] }): void {
    this.setData('users', data.users);
    this.setData('daily_activities', data.dailyActivities);
    this.setData('manual_entries', data.manualEntries);
  }
}

export const localStorageService = new LocalStorageService();
