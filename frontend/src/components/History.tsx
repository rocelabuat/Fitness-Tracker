import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Calendar } from "lucide-react";
import { storageService } from "@/services/storageService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailyActivity } from "@/types/fitness";

export const History = () => {
  const [historyData, setHistoryData] = useState<DailyActivity[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setHistoryData(storageService.getHistoryData(7));
    const refresh = () => setHistoryData(storageService.getHistoryData(7));
    window.addEventListener("fitness-data-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("fitness-data-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const handleExport = () => {
    const csvData = storageService.exportToCsv();
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

  const maxSteps = Math.max(...historyData.map((d) => d.steps), 1);
  const caloriesFromSteps = (steps: number) => Math.round(steps * 0.04);
  const derivedDayCalories = (d: DailyActivity) =>
    caloriesFromSteps(d.steps) +
    d.manualEntries.reduce((s, e) => s + e.calories, 0);
  const totalCalories = historyData.reduce(
    (sum, d) => sum + derivedDayCalories(d),
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

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {historyData.length > 0 && (
          <>
            <Card className="p-4 shadow-card">
              <div className="text-center">
                <div className="text-2xl font-bold text-steps mb-1">
                  {Math.round(
                    historyData.reduce((sum, d) => sum + d.steps, 0) /
                      historyData.length
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">avg steps</p>
              </div>
            </Card>

            <Card className="p-4 shadow-card">
              <div className="text-center">
                <div className="text-2xl font-bold text-calories mb-1">
                  {Math.round(
                    historyData.reduce(
                      (sum, d) => sum + derivedDayCalories(d),
                      0
                    ) / historyData.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground">avg calories</p>
              </div>
            </Card>

            <Card className="p-4 shadow-card">
              <div className="text-center">
                <div className="text-2xl font-bold text-distance mb-1">
                  {(
                    historyData.reduce((sum, d) => sum + d.distance, 0) /
                    historyData.length /
                    1000
                  ).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">avg km</p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Total Calories (includes manual activities) */}
      {historyData.length > 0 && (
        <div className="mb-6">
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total calories (last 7 days)
              </p>
              <p className="text-xl font-bold text-calories">
                {totalCalories.toLocaleString()} cal
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Daily History */}
      <Card className="shadow-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Daily Activity</h2>
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
                const isToday = index === 0;
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
                            : date.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
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
                        <span>{derivedDayCalories(day)} cal</span>
                        <span>{(day.distance / 1000).toFixed(1)} km</span>
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
              {selectedDay
                ? new Date(selectedDay.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
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
                    {derivedDayCalories(selectedDay)} cal
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="text-lg font-semibold text-distance">
                    {(selectedDay.distance / 1000).toFixed(2)} km
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
