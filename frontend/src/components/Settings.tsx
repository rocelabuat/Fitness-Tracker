import { useState } from "react";
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
import { Target, User, Trash2, Save, Palette } from "lucide-react";
import { storageService } from "@/services/storageService";
import { UserProfile } from "@/types/fitness";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Settings = () => {
  const [profile, setProfile] = useState<UserProfile>(
    storageService.getProfile()
  );
  const [stepGoalInput, setStepGoalInput] = useState<string>(
    String(storageService.getProfile().stepGoal ?? "")
  );
  const { toast } = useToast();

  const handleSave = () => {
    const parsedStepGoal = parseInt(stepGoalInput, 10);
    const profileToSave: UserProfile = {
      ...profile,
      stepGoal: isNaN(parsedStepGoal) ? profile.stepGoal : parsedStepGoal,
    };
    storageService.updateProfile(profileToSave);
    setProfile(profileToSave);
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all fitness data? This action cannot be undone."
      )
    ) {
      storageService.clearAllData();
      const refreshed = storageService.getProfile();
      setProfile(refreshed);
      setStepGoalInput(String(refreshed.stepGoal ?? ""));
      toast({
        title: "Data cleared",
        description: "All fitness data has been removed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your fitness tracking</p>
      </div>

      {/* Theme Settings */}
      <Card className="mb-6 shadow-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Theme</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Switch between dark and light mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </Card>

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
        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
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
            <Button
              onClick={handleClearData}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
