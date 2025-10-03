import { FitnessData, DailyActivityUI, UserProfile, ManualEntryUI } from '../types/fitness';

const STORAGE_KEY = 'fitness-tracker-data';

export class StorageService {
  private data: FitnessData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): FitnessData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }

    // Default data structure
    return {
      profile: {
        stepGoal: 10000,
        // gender left undefined by default; user may set in Settings
      },
      activities: [],
      lastSync: Date.now(),
    };
  }

  private saveData() {
    try {
      this.data.lastSync = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      // Notify listeners in the app that data has changed
      try {
        window.dispatchEvent(new Event('fitness-data-updated'));
      } catch (_) {
        // window may be unavailable in some environments
      }
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  getProfile(): UserProfile {
    return { ...this.data.profile };
  }

  updateProfile(profile: Partial<UserProfile>) {
    this.data.profile = { ...this.data.profile, ...profile };
    this.saveData();
  }

  getTodaysActivity(): DailyActivityUI {
    const today = new Date().toDateString();
    let activity = this.data.activities.find(a => a.date === today);
    
    if (!activity) {
      activity = {
        date: today,
        steps: 0,
        calories: 0,
        distance: 0,
        manualEntries: [],
      };
      this.data.activities.push(activity);
    }
    
    return activity;
  }

  updateTodaysSteps(steps: number) {
    const activity = this.getTodaysActivity();
    activity.steps = steps;
    activity.calories = this.calculateCalories(steps);
    activity.distance = this.calculateDistance(steps);
    this.saveData();
  }

  addManualEntry(entry: Omit<ManualEntryUI, 'id'>) {
    const activity = this.getTodaysActivity();
    const newEntry: ManualEntryUI = {
      ...entry,
      id: Date.now().toString(),
      // ensure timestamp exists for UI entries
      timestamp: (entry as Partial<ManualEntryUI>).timestamp ?? Date.now(),
    };
    activity.manualEntries.push(newEntry);
    activity.calories += entry.calories;
    this.saveData();
  }

  getHistoryData(days = 7): DailyActivityUI[] {
    return this.data.activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  }

  exportToCsv(): string {
    const headers = ['Date', 'Steps', 'Calories', 'Distance (km)', 'Manual Entries'];
    const rows = this.data.activities.map(activity => [
      activity.date,
      activity.steps.toString(),
      activity.calories.toString(),
      (activity.distance / 1000).toFixed(2),
      activity.manualEntries.length.toString(),
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  private calculateCalories(steps: number): number {
    return Math.round(steps * 0.04);
  }

  private calculateDistance(steps: number): number {
    // Average step length of 0.762 meters
    return Math.round(steps * 0.762);
  }

  clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadData();
  }
}

export const storageService = new StorageService();