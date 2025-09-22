// Backend API Models (matching Django models)
export interface User {
  id: number;
  username: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F' | 'O'; // M/F/O as per backend
  weight?: number; // kg (20-300)
  height?: number; // cm (100-250)
  age?: number; // years (1-150)
  step_goal: number; // daily step goal (1000-100000, default: 10000)
}

export interface DailyActivity {
  id: number;
  user: number; // user ID
  date: string; // YYYY-MM-DD format
  steps: number; // 0-100000
  distance: number; // meters (0-1000000)
  calories: number; // 0-10000
  manual_entries?: ManualEntry[]; // populated by backend
}

export interface ManualEntry {
  id: number;
  daily_activity: number; // daily activity ID
  activity: string; // activity name (2-50 characters)
  duration?: number; // minutes (0-1440, optional)
  calories: number; // 0-5000
}

// Frontend-specific types for UI compatibility
export interface UserProfile {
  stepGoal: number;
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female'; // converted from M/F/O
}

export interface AuthUser {
  id: number;
  username: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F' | 'O';
  weight?: number;
  height?: number;
  age?: number;
  step_goal: number;
}

// Legacy types for backward compatibility with existing UI
export interface DailyActivityUI {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  manualEntries: ManualEntryUI[];
}

export interface ManualEntryUI {
  id: string;
  activity: string;
  duration: number; // minutes
  calories: number;
  timestamp: number;
}

export interface FitnessData {
  profile: UserProfile;
  activities: DailyActivityUI[];
  lastSync: number;
}

// API Request/Response types
export interface CreateUserRequest {
  username: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F' | 'O';
  weight?: number;
  height?: number;
  age?: number;
  step_goal?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateDailyActivityRequest {
  user: number;
  date: string;
  steps: number;
  distance: number;
  calories: number;
}

export interface CreateManualEntryRequest {
  daily_activity: number;
  activity: string;
  duration?: number;
  calories: number;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F' | 'O';
  weight?: number;
  height?: number;
  age?: number;
  step_goal?: number;
}

export interface UpdateDailyActivityRequest {
  user?: number;
  date?: string;
  steps?: number;
  distance?: number;
  calories?: number;
}

export interface UpdateManualEntryRequest {
  daily_activity?: number;
  activity?: string;
  duration?: number;
  calories?: number;
}