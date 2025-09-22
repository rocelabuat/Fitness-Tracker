import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser } from "@/types/fitness";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  gender?: "male" | "female";
  weight?: number;
  height?: number;
  age?: number;
  step_goal?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem("fitness_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("fitness_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: AuthUser = {
        id: 1,
        username,
        gender: "male",
        weight: 70,
        height: 175,
        age: 25,
        step_goal: 10000,
      };

      setUser(mockUser);
      localStorage.setItem("fitness_user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      const newUser: AuthUser = {
        id: Date.now(), // Mock ID
        username: userData.username,
        gender: userData.gender,
        weight: userData.weight,
        height: userData.height,
        age: userData.age,
        step_goal: userData.step_goal || 10000,
      };

      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitness_user");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
