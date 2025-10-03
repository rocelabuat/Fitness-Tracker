import { 
  User, 
  DailyActivity, 
  ManualEntry, 
  DailyActivityUI, 
  ManualEntryUI, 
  UserProfile 
} from '@/types/fitness';

export class DataConverter {
  
  // Convert backend User to frontend UserProfile
  static userToProfile(user: User): UserProfile {
    return {
      stepGoal: user.step_goal,
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender === 'M' ? 'male' : user.gender === 'F' ? 'female' : undefined,
    };
  }

  // Convert frontend UserProfile to backend User update data
  static profileToUserUpdate(profile: UserProfile, userId: number): Partial<User> {
    const updateData: Partial<User> = {};
    
    if (profile.stepGoal !== undefined) updateData.step_goal = profile.stepGoal;
    if (profile.weight !== undefined) updateData.weight = profile.weight;
    if (profile.height !== undefined) updateData.height = profile.height;
    if (profile.age !== undefined) updateData.age = profile.age;
    if (profile.gender !== undefined) {
      updateData.gender = profile.gender === 'male' ? 'M' : profile.gender === 'female' ? 'F' : 'O';
    }
    
    return updateData;
  }

  // Convert backend ManualEntry to frontend ManualEntryUI
  static manualEntryToUI(entry: ManualEntry): ManualEntryUI {
    return {
      id: entry.id.toString(),
      activity: entry.activity,
      duration: entry.duration || 0,
      calories: entry.calories,
      timestamp: Date.now(), // We'll use current time as fallback
    };
  }

  // Convert frontend ManualEntryUI to backend ManualEntry
  static manualEntryUIToBackend(entry: ManualEntryUI, userId: number): Partial<ManualEntry> {
    return {
      user: userId,
      activity: entry.activity,
      duration: entry.duration || undefined,
      calories: entry.calories,
    };
  }

  // Convert backend DailyActivity to frontend DailyActivityUI
  static dailyActivityToUI(activity: DailyActivity): DailyActivityUI {
    return {
      date: activity.date,
      steps: activity.steps,
      calories: activity.calories,
      distance: activity.distance,
      manualEntries: (activity.manual_entries || []).map(entry => 
        this.manualEntryToUI(entry)
      ),
    };
  }

  // Convert frontend DailyActivityUI to backend DailyActivity
  static dailyActivityUIToBackend(activity: DailyActivityUI, userId: number): Partial<DailyActivity> {
    return {
      user: userId,
      date: activity.date,
      steps: activity.steps,
      distance: activity.distance,
      calories: activity.calories,
    };
  }

  // Convert array of backend DailyActivities to frontend format
  static dailyActivitiesToUI(activities: DailyActivity[]): DailyActivityUI[] {
    return activities.map(activity => this.dailyActivityToUI(activity));
  }

  // Calculate derived calories from steps (for UI display)
  static calculateCaloriesFromSteps(steps: number): number {
    return Math.round(steps * 0.04);
  }

  // Calculate total calories for a day (steps + manual entries)
  static calculateTotalCalories(activity: DailyActivityUI): number {
    const stepsCalories = this.calculateCaloriesFromSteps(activity.steps);
    const manualCalories = activity.manualEntries.reduce(
      (sum, entry) => sum + entry.calories, 
      0
    );
    return stepsCalories + manualCalories;
  }

  // Get today's date in YYYY-MM-DD format
  static getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Format date for display
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Format date for short display
  static formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Format weekday
  static formatWeekday(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    weekday: 'long',
    timeZone: 'Asia/Manila',
  });
}

  // Convert distance from meters to kilometers
  static metersToKilometers(meters: number): number {
    return meters / 1000;
  }

  // Convert kilometers to meters
  static kilometersToMeters(km: number): number {
    return km * 1000;
  }

  // Validate user data
  static validateUser(user: Partial<User>): string[] {
    const errors: string[] = [];
    
    if (user.username && (user.username.length < 3 || user.username.length > 50)) {
      errors.push('Username must be between 3 and 50 characters');
    }
    
    if (user.weight && (user.weight < 20 || user.weight > 300)) {
      errors.push('Weight must be between 20 and 300 kg');
    }
    
    if (user.height && (user.height < 100 || user.height > 250)) {
      errors.push('Height must be between 100 and 250 cm');
    }
    
    if (user.age && (user.age < 1 || user.age > 150)) {
      errors.push('Age must be between 1 and 150 years');
    }
    
    if (user.step_goal && (user.step_goal < 1000 || user.step_goal > 100000)) {
      errors.push('Step goal must be between 1000 and 100000 steps');
    }
    
    return errors;
  }

  // Validate daily activity data
  static validateDailyActivity(activity: Partial<DailyActivity>): string[] {
    const errors: string[] = [];
    
    if (activity.steps !== undefined && (activity.steps < 0 || activity.steps > 100000)) {
      errors.push('Steps must be between 0 and 100000');
    }
    
    if (activity.distance !== undefined && (activity.distance < 0 || activity.distance > 1000000)) {
      errors.push('Distance must be between 0 and 1000000 meters');
    }
    
    if (activity.calories !== undefined && (activity.calories < 0 || activity.calories > 10000)) {
      errors.push('Calories must be between 0 and 10000');
    }
    
    return errors;
  }

  // Validate manual entry data
  static validateManualEntry(entry: Partial<ManualEntry>): string[] {
    const errors: string[] = [];
    
    if (entry.activity && (entry.activity.length < 2 || entry.activity.length > 50)) {
      errors.push('Activity name must be between 2 and 50 characters');
    }
    
    if (entry.duration !== undefined && (entry.duration < 0 || entry.duration > 1440)) {
      errors.push('Duration must be between 0 and 1440 minutes');
    }
    
    if (entry.calories !== undefined && (entry.calories < 0 || entry.calories > 5000)) {
      errors.push('Calories must be between 0 and 5000');
    }
    
    return errors;
  }
}
