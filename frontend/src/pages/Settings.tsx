import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Target, User, Trash2, Save, LogOut, Loader2 } from "lucide-react";
import { UserProfile } from "@/types/fitness";
import { useToast } from "@/hooks/use-toast";
import { useFitness } from "@/contexts/FitnessContext";
import { apiService } from "@/services/apiService";
import { useQueryClient } from "@tanstack/react-query";

export const Settings = () => {
  const { currentUser, userProfile, updateProfile, signOut, isLoading } =
    useFitness();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stepGoalInput, setStepGoalInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setStepGoalInput(String(userProfile.stepGoal));
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!profile || !currentUser) return;

    const parsedStepGoal = parseInt(stepGoalInput, 10);
    const profileToSave: UserProfile = {
      ...profile,
      stepGoal: isNaN(parsedStepGoal) ? profile.stepGoal : parsedStepGoal,
    };

    setIsSaving(true);
    try {
      await updateProfile(profileToSave);
      setProfile(profileToSave);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!currentUser) return;
    try {
      await apiService.clearUserHistory(currentUser.id);

      // Invalidate all relevant queries to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ["todaysActivity"] });
      queryClient.invalidateQueries({ queryKey: ["dailyActivities"] });
      queryClient.invalidateQueries({ queryKey: ["manualEntries"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyActivity"] });

      toast({
        title: "All data cleared",
        description:
          "Your fitness history and manual entries have been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Clear failed",
        description: error.message || "Failed to clear data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!profile || !currentUser) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your fitness tracking</p>
        {currentUser && (
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as:{" "}
            <span className="font-medium">{currentUser.username}</span>
          </p>
        )}
      </div>

      {/* Goal Settings */}
      <Card className="mb-6 shadow-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Daily Goal</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="stepGoal" className="text-foreground">
                Step Goal
              </Label>
              <Input
                id="stepGoal"
                type="number"
                value={stepGoalInput}
                onChange={(e) => setStepGoalInput(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 10,000 steps per day
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Settings */}
      <Card className="mb-6 shadow-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender" className="text-foreground">
                Gender
              </Label>
              <Select
                value={profile.gender || ""}
                onValueChange={(value) =>
                  setProfile({
                    ...profile,
                    gender: (value as "male" | "female") || undefined,
                  })
                }
              >
                <SelectTrigger id="gender" className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weight" className="text-foreground">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={profile.weight || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    weight: parseInt(e.target.value) || undefined,
                  })
                }
                className="mt-1"
                placeholder="70"
                min="30"
                max="300"
              />
            </div>

            <div>
              <Label htmlFor="height" className="text-foreground">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={profile.height || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    height: parseInt(e.target.value) || undefined,
                  })
                }
                className="mt-1"
                placeholder="170"
                min="100"
                max="250"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-foreground">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={profile.age || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: parseInt(e.target.value) || undefined,
                  })
                }
                className="mt-1"
                placeholder="25"
                min="13"
                max="120"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            Profile information helps improve calorie calculations (optional)
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>

        <Card className="shadow-card border-destructive/20">
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2">
              Data Management
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clear all fitness data including history and manual entries. This
              action cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all fitness data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your history and manual
                    entries. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        <Card className="shadow-card border-orange-200 dark:border-orange-800">
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of your account. You can sign back in anytime.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the sign-in screen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Yes, sign me out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
};
