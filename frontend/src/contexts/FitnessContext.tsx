import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { DataConverter } from "@/services/dataConverter";
import {
  User,
  DailyActivity,
  ManualEntry,
  DailyActivityUI,
  ManualEntryUI,
  UserProfile,
  CreateUserRequest,
  CreateDailyActivityRequest,
  CreateManualEntryRequest,
  LoginRequest,
} from "@/types/fitness";
import { useToast } from "@/hooks/use-toast";

interface FitnessContextType {
  // User management
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Today's activity
  todaysActivity: DailyActivityUI | null;

  // Actions
  signIn: (loginData: LoginRequest) => Promise<void>;
  signUp: (userData: CreateUserRequest) => Promise<void>;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;

  // Activity management
  updateTodaysSteps: (steps: number) => Promise<void>;
  addManualEntry: (
    entry: Omit<ManualEntryUI, "id" | "timestamp">
  ) => Promise<void>;
  updateDailyActivity: (activity: Partial<DailyActivityUI>) => Promise<void>;

  // History
  getRecentActivities: (days?: number) => Promise<DailyActivityUI[]>;

  // Utility
  refreshData: () => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

interface FitnessProviderProps {
  children: ReactNode;
}

export const FitnessProvider: React.FC<FitnessProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Prevent premature redirects before we read localStorage
  const [authInitializing, setAuthInitializing] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State to track current user ID for reactive queries
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check for stored user on mount and control initialization timing
  useEffect(() => {
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setCurrentUserId(storedUserId);
      // Keep initializing until the first user query completes
      return;
    }
    // No stored user; we can finish initialization immediately
    setAuthInitializing(false);
  }, []);

  // When there is a stored user, finish initialization only after the user query resolves
  useEffect(() => {
    if (currentUserId && !userLoading) {
      setAuthInitializing(false);
    }
  }, [currentUserId, userLoading]);

  // Query for current user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;

      const userId = parseInt(currentUserId);
      return apiService.getUser(userId);
    },
    enabled: !!currentUserId,
    staleTime: 0, // Always refetch when enabled
  });

  // Update state when user data changes
  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
      setUserProfile(DataConverter.userToProfile(userData));
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
    }
  }, [userData]);

  // Invalidate today's activity query when currentUser changes
  useEffect(() => {
    if (currentUser) {
      queryClient.invalidateQueries({ queryKey: ["todaysActivity"] });
    }
  }, [currentUser, queryClient]);

  // Query for today's activity
  const { data: todaysActivityData } = useQuery({
    queryKey: ["todaysActivity", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      const activity = await apiService.getOrCreateTodayActivity(
        currentUser.id
      );

      // Fetch today's manual entries
      const today = DataConverter.getTodayDate();
      const manualEntries = await apiService.getManualEntriesByUser(
        currentUser.id
      );
      const todaysManualEntries = manualEntries.filter(
        (entry) => entry.date === today
      );

      // Attach manual entries to the activity
      return {
        ...activity,
        manual_entries: todaysManualEntries,
      };
    },
    enabled: !!currentUser,
    refetchInterval: 60000, // Refetch every minute
  });

  // Convert today's activity to UI format
  const todaysActivity = todaysActivityData
    ? DataConverter.dailyActivityToUI(todaysActivityData)
    : null;

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (loginData: LoginRequest) => {
      return apiService.authenticateUser(loginData);
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUserId", user.id.toString());
      setCurrentUserId(user.id.toString());
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      return apiService.createUser(userData);
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUserId", user.id.toString());
      setCurrentUserId(user.id.toString());
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Account created successfully",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!currentUser) throw new Error("No user logged in");

      const userUpdate = DataConverter.profileToUserUpdate(
        profile,
        currentUser.id
      );
      return apiService.updateUser(currentUser.id, userUpdate);
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update today's steps mutation
  const updateStepsMutation = useMutation({
    mutationFn: async (steps: number) => {
      if (!currentUser || !todaysActivityData)
        throw new Error("No user or activity");

      // Calculate distance based on steps (rough estimate: 0.7m per step, convert to km)
      const distance = Math.round(((steps * 0.7) / 1000) * 100) / 100; // Convert to km with 2 decimal places

      // Calculate calories from steps (rough estimate: 0.04 calories per step)
      const calories = Math.round(steps * 0.04);

      return apiService.updateDailyActivity(todaysActivityData.id, {
        steps,
        distance,
        calories,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaysActivity"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update steps",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add manual entry mutation
  const addManualEntryMutation = useMutation({
    mutationFn: async (entry: Omit<ManualEntryUI, "id" | "timestamp">) => {
      if (!currentUser || !todaysActivityData)
        throw new Error("No user or activity");

      const entryData = {
        user: currentUser.id,
        date: todaysActivityData.date,
        activity: entry.activity,
        duration: entry.duration || 0,
        calories: entry.calories,
      };

      return apiService.createManualEntry(entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaysActivity"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Activity added",
        description: "Your activity has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Context actions
  const signIn = async (loginData: LoginRequest) => {
    await signInMutation.mutateAsync(loginData);
  };

  const signUp = async (userData: CreateUserRequest) => {
    await signUpMutation.mutateAsync(userData);
  };

  const signOut = () => {
    localStorage.removeItem("currentUserId");
    setCurrentUserId(null);
    queryClient.clear();
    setCurrentUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const updateProfile = async (profile: UserProfile) => {
    await updateProfileMutation.mutateAsync(profile);
  };

  const updateTodaysSteps = async (steps: number) => {
    await updateStepsMutation.mutateAsync(steps);
  };

  const addManualEntry = async (
    entry: Omit<ManualEntryUI, "id" | "timestamp">
  ) => {
    await addManualEntryMutation.mutateAsync(entry);
  };

  const updateDailyActivity = async (activity: Partial<DailyActivityUI>) => {
    if (!currentUser || !todaysActivityData) return;

    const updateData = DataConverter.dailyActivityUIToBackend(
      activity as DailyActivityUI,
      currentUser.id
    );

    await apiService.updateDailyActivity(todaysActivityData.id, updateData);
    queryClient.invalidateQueries({ queryKey: ["todaysActivity"] });
  };

  const getRecentActivities = async (
    days: number = 7
  ): Promise<DailyActivityUI[]> => {
    if (!currentUser) return [];

    const endDate = DataConverter.getTodayDate();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch both daily activities and manual entries
    const [activities, manualEntries] = await Promise.all([
      apiService.getDailyActivitiesByDateRange(startDateStr, endDate),
      apiService.getManualEntriesByUser(currentUser.id),
    ]);

    // Filter manual entries by date range
    const filteredManualEntries = manualEntries.filter(
      (entry) => entry.date >= startDateStr && entry.date <= endDate
    );

    // Group manual entries by date
    const manualEntriesByDate = filteredManualEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, ManualEntry[]>);

    // Convert activities to UI format and attach manual entries
    const activitiesWithManualEntries = activities.map((activity) => {
      const uiActivity = DataConverter.dailyActivityToUI(activity);
      const manualEntriesForDate = manualEntriesByDate[activity.date] || [];
      uiActivity.manualEntries = manualEntriesForDate.map((entry) =>
        DataConverter.manualEntryToUI(entry)
      );
      return uiActivity;
    });

    return activitiesWithManualEntries;
  };

  const refreshData = () => {
    queryClient.invalidateQueries();
  };

  const contextValue: FitnessContextType = {
    currentUser,
    userProfile,
    // Expose loading as true while initializing or while fetching user
    isLoading: authInitializing || userLoading,
    isAuthenticated,
    todaysActivity,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateTodaysSteps,
    addManualEntry,
    updateDailyActivity,
    getRecentActivities,
    refreshData,
  };

  return (
    <FitnessContext.Provider value={contextValue}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = (): FitnessContextType => {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error("useFitness must be used within a FitnessProvider");
  }
  return context;
};
