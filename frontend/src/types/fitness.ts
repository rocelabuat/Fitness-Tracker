export interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  manualEntries: ManualEntry[];
}

export interface ManualEntry {
  id: string;
  activity: string;
  duration: number; // minutes
  calories: number;
  timestamp: number;
}

export interface UserProfile {
  stepGoal: number;
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female';
}

export interface FitnessData {
  profile: UserProfile;
  activities: DailyActivity[];
  lastSync: number;
}