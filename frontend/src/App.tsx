import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Dashboard } from "@/components/Dashboard";
import { History } from "@/components/History";
import { Settings } from "@/components/Settings";
import { ManualEntry } from "@/components/ManualEntry";
import { Navigation } from "@/components/Navigation";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard onManualEntryClick={() => setShowManualEntry(true)} />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {renderActiveTab()}

            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            {showManualEntry && (
              <ManualEntry onClose={() => setShowManualEntry(false)} />
            )}
          </div>

          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
