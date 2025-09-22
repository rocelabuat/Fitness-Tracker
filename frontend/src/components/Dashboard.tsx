import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Target, Calendar, Loader2 } from "lucide-react";
import { motionSensor } from "@/services/motionSensor";
import { DataConverter } from "@/services/dataConverter";
import { useFitness } from "@/contexts/FitnessContext";
import { DailyActivityUI } from "@/types/fitness";

interface DashboardProps {
  onManualEntryClick: () => void;
}

export const Dashboard = ({ onManualEntryClick }: DashboardProps) => {
  const {
    todaysActivity,
    userProfile,
    isLoading,
    updateTodaysSteps,
    isAuthenticated,
  } = useFitness();

  const [isTracking, setIsTracking] = useState(false);
  const [localSteps, setLocalSteps] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !todaysActivity) return;

    // Set up motion sensor if supported
    const initMotionSensor = async () => {
      if (motionSensor.isMotionSupported()) {
        const hasPermission = await motionSensor.requestPermission();
        if (hasPermission) {
          motionSensor.startTracking(todaysActivity.steps);
          setIsTracking(true);

          motionSensor.onStepUpdate((steps) => {
            setLocalSteps(steps);
            // Debounce API calls to avoid too many requests
            const timeoutId = setTimeout(() => {
              updateTodaysSteps(steps);
            }, 5000); // Update every 5 seconds max

            return () => clearTimeout(timeoutId);
          });
        }
      }
    };

    initMotionSensor();

    return () => {
      motionSensor.stopTracking();
    };
  }, [isAuthenticated, todaysActivity, updateTodaysSteps]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !todaysActivity || !userProfile) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view your dashboard
          </p>
        </div>
      </div>
    );
  }

  const displaySteps = isTracking ? localSteps : todaysActivity.steps;
  const progressPercentage = (displaySteps / userProfile.stepGoal) * 100;
  const today = DataConverter.formatDate(todaysActivity.date);
  const totalCalories = DataConverter.calculateTotalCalories(todaysActivity);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">FitTracker</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {isTracking ? "Live tracking" : "Manual entry"}
          </div>
        </div>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Main Step Counter */}
      <Card className="mb-6 p-6 shadow-card bg-gradient-card">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              {displaySteps.toLocaleString()}
            </div>
            <p className="text-muted-foreground">steps today</p>
          </div>

          <div className="mb-4">
            <Progress
              value={Math.min(progressPercentage, 100)}
              className="h-3 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% of{" "}
              {userProfile.stepGoal.toLocaleString()} goal
            </p>
          </div>

          {!isTracking && (
            <Button onClick={onManualEntryClick} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Steps
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-calories/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-calories" />
            </div>
            <div>
              <div className="text-2xl font-bold text-calories">
                {totalCalories}
              </div>
              <p className="text-sm text-muted-foreground">calories</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-distance/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-distance" />
            </div>
            <div>
              <div className="text-2xl font-bold text-distance">
                {DataConverter.metersToKilometers(
                  todaysActivity.distance
                ).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">km</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Manual Entries */}
      {todaysActivity.manualEntries.length > 0 && (
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold mb-3 text-foreground">
            Today's Activities
          </h3>
          <div className="space-y-2">
            {todaysActivity.manualEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {entry.activity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.duration} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-calories">
                    {entry.calories} cal
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
