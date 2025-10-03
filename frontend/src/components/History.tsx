import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  Calendar,
  Loader2,
  Activity,
} from "lucide-react";
import { useFitness } from "@/contexts/FitnessContext";
import { DataConverter } from "@/services/dataConverter";
import { apiService } from "@/services/apiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailyActivityUI, DailyActivity, ManualEntry } from "@/types/fitness";

export const History = () => {
  const { getRecentActivities, isAuthenticated, isLoading, currentUser } =
    useFitness();
  const [historyData, setHistoryData] = useState<DailyActivityUI[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyActivityUI | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<{
    average_steps: number;
    average_distance: number;
    average_calories: number;
    total_calories: number;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadHistoryData();
    }
  }, [isAuthenticated, currentUser]);

  const loadHistoryData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Fetch weekly stats
      const weeklyData = await apiService.getWeeklyActivity(currentUser.id);
      setWeeklyStats(weeklyData);

      // Also get the formatted history data for backward compatibility
      const data = await getRecentActivities(7);
      setHistoryData(data);
    } catch (error) {
      console.error("Failed to load history data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (historyData.length === 0) return;

    const headers = [
      "Date",
      "Steps",
      "Distance (km)",
      "Calories",
      "Manual Entries",
    ];
    const csvRows = [headers.join(",")];

    historyData.forEach((day) => {
      const manualEntriesCount = day.manualEntries.length;
      const distanceKm = day.distance; // Distance is already in km
      const totalCalories = DataConverter.calculateTotalCalories(day);

      csvRows.push(
        [
          day.date,
          day.steps.toString(),
          distanceKm.toFixed(2),
          totalCalories.toString(),
          manualEntriesCount.toString(),
        ].join(",")
      );
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitness-data-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view your history
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  const maxSteps = Math.max(...historyData.map((d) => d.steps), 1);
  const totalCalories = historyData.reduce(
    (sum, d) => sum + DataConverter.calculateTotalCalories(d),
    0
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">Last 7 days activity</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Weekly Summary Stats from API */}
      {weeklyStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 shadow-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-steps mb-1">
                {Math.round(weeklyStats.average_steps).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">avg steps</p>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-calories mb-1">
                {Math.round(weeklyStats.average_calories)}
              </div>
              <p className="text-xs text-muted-foreground">avg calories</p>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-distance mb-1">
                {weeklyStats.average_distance.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">avg km</p>
            </div>
          </Card>
        </div>
      )}

      {/* Total Calories from API */}
      {weeklyStats && (
        <div className="mb-6">
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total calories (last 7 days)
              </p>
              <p className="text-xl font-bold text-calories">
                {weeklyStats.total_calories.toLocaleString()} cal
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Legacy Daily History (keeping for backward compatibility) */}
      <Card className="shadow-card mt-6">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">
              Daily Activity (Legacy View)
            </h2>
          </div>
        </div>

        <div className="p-4">
          {historyData.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No activity data yet</p>
              <p className="text-sm text-muted-foreground">
                Start tracking to see your history
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {historyData.map((day, index) => {
                const date = new Date(day.date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const stepPercentage = (day.steps / maxSteps) * 100;

                return (
                  <Card
                    key={day.date}
                    className="w-[280px] h-[350px] p-4 shadow-card cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                    onClick={() => {
                      setSelectedDay(day);
                      setDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {isToday
                            ? "Today"
                            : DataConverter.formatWeekday(day.date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {DataConverter.formatDateShort(day.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-steps leading-tight">
                          {day.steps.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">steps</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full"
                          style={{ width: `${Math.min(stepPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {DataConverter.calculateTotalCalories(day)} cal
                        </span>
                        <span>{day.distance.toFixed(1)} km</span>
                        {day.manualEntries.length > 0 && (
                          <span>{day.manualEntries.length} activities</span>
                        )}
                      </div>
                    </div>

                    {day.manualEntries.length > 0 && (
                      <div className="mt-3 space-y-2 overflow-auto">
                        {day.manualEntries.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="text-foreground truncate">
                              {entry.activity}{" "}
                              <span className="text-muted-foreground">
                                • {entry.duration} min
                              </span>
                            </div>
                            <div className="text-calories font-medium">
                              {entry.calories} cal
                            </div>
                          </div>
                        ))}
                        {day.manualEntries.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{day.manualEntries.length - 5} more
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        View details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? DataConverter.formatDate(selectedDay.date) : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Steps</div>
                  <div className="text-lg font-semibold text-steps">
                    {selectedDay.steps.toLocaleString()}
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="text-lg font-semibold text-calories">
                    {DataConverter.calculateTotalCalories(selectedDay)} cal
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="text-lg font-semibold text-distance">
                    {selectedDay.distance.toFixed(2)} km
                  </div>
                </Card>
              </div>

              <div>
                <div className="font-medium mb-2 text-foreground">
                  Manual Activities
                </div>
                {selectedDay.manualEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No manual activities recorded
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {selectedDay.manualEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="p-3 flex items-center justify-between"
                      >
                        <div className="text-foreground">
                          {entry.activity}{" "}
                          <span className="text-muted-foreground">
                            • {entry.duration} min
                          </span>
                        </div>
                        <div className="text-calories font-medium">
                          {entry.calories} cal
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
