import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Activity, Loader2 } from "lucide-react";
import { useFitness } from "@/contexts/FitnessContext";
import { useToast } from "@/hooks/use-toast";

interface ManualEntryProps {
  onClose: () => void;
}

const ACTIVITY_OPTIONS = [
  { name: "Walking", caloriesPerMinute: 3.5 },
  { name: "Running", caloriesPerMinute: 12 },
  { name: "Cycling", caloriesPerMinute: 8 },
  { name: "Swimming", caloriesPerMinute: 10 },
  { name: "Yoga", caloriesPerMinute: 3 },
  { name: "Weight Training", caloriesPerMinute: 6 },
  { name: "Dancing", caloriesPerMinute: 5 },
  { name: "Custom", caloriesPerMinute: 5 },
];

export const ManualEntry = ({ onClose }: ManualEntryProps) => {
  const { updateTodaysSteps, addManualEntry, todaysActivity, isAuthenticated } =
    useFitness();

  const [entryType, setEntryType] = useState<"steps" | "activity">("steps");
  const [steps, setSteps] = useState("");
  const [activity, setActivity] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddSteps = async () => {
    const stepCount = parseInt(steps);
    if (stepCount > 0) {
      setIsLoading(true);
      try {
        if (todaysActivity) {
          const newSteps = todaysActivity.steps + stepCount;
          await updateTodaysSteps(newSteps);
          toast({
            title: "Steps added",
            description: `Added ${stepCount.toLocaleString()} steps to your daily total.`,
          });
          onClose();
        }
      } catch (error) {
        toast({
          title: "Failed to add steps",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddActivity = async () => {
    const durationNum = parseInt(duration);
    const caloriesNum = parseInt(calories);
    const activityName = activity === "Custom" ? customActivity : activity;

    if (activityName && durationNum > 0 && caloriesNum > 0) {
      setIsLoading(true);
      try {
        await addManualEntry({
          activity: activityName,
          duration: durationNum,
          calories: caloriesNum,
        });
        onClose();
      } catch (error) {
        toast({
          title: "Failed to add activity",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleActivityChange = (value: string) => {
    setActivity(value);
    const activityOption = ACTIVITY_OPTIONS.find((a) => a.name === value);
    if (activityOption && duration) {
      setCalories(
        (activityOption.caloriesPerMinute * parseInt(duration)).toString()
      );
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const activityOption = ACTIVITY_OPTIONS.find((a) => a.name === activity);
    if (activityOption && value) {
      setCalories(
        (activityOption.caloriesPerMinute * parseInt(value)).toString()
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Please sign in to add activities
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Add Activity</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Entry Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={entryType === "steps" ? "default" : "outline"}
              onClick={() => setEntryType("steps")}
              className="flex-1"
              size="sm"
            >
              Add Steps
            </Button>
            <Button
              variant={entryType === "activity" ? "default" : "outline"}
              onClick={() => setEntryType("activity")}
              className="flex-1"
              size="sm"
            >
              Add Exercise
            </Button>
          </div>

          {entryType === "steps" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="steps" className="text-foreground">
                  Number of Steps
                </Label>
                <Input
                  id="steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="1000"
                  className="mt-1"
                  min="1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSteps}
                  className="flex-1"
                  disabled={!steps || parseInt(steps) <= 0 || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Steps
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="activity-select" className="text-foreground">
                  Activity Type
                </Label>
                <Select onValueChange={handleActivityChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_OPTIONS.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activity === "Custom" && (
                <div>
                  <Label htmlFor="custom-activity" className="text-foreground">
                    Custom Activity
                  </Label>
                  <Input
                    id="custom-activity"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    placeholder="Enter activity name"
                    className="mt-1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-foreground">
                    Duration (min)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="30"
                    className="mt-1"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="calories" className="text-foreground">
                    Calories
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="150"
                    className="mt-1"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddActivity}
                  className="flex-1"
                  disabled={
                    !activity ||
                    !duration ||
                    !calories ||
                    (activity === "Custom" && !customActivity) ||
                    isLoading
                  }
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Activity
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
