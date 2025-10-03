import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FitnessProvider, useFitness } from "@/contexts/FitnessContext";
import { Dashboard } from "@/pages/Dashboard";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { ManualEntry } from "@/pages/ManualEntry";
import { Navigation } from "@/components/Navigation";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useFitness();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

const FitnessApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Keep active tab in sync with the current pathname
  useEffect(() => {
    const path = location.pathname.split("/")[1] || "dashboard";
    if (path === "dashboard" || path === "history" || path === "settings") {
      setActiveTab(path);
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

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
    <div className="min-h-screen bg-background">
      {renderActiveTab()}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      {showManualEntry && (
        <ManualEntry onClose={() => setShowManualEntry(false)} />
      )}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FitnessProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <FitnessApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <FitnessApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <FitnessApp />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster />
            <Sonner />
          </TooltipProvider>
        </FitnessProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
