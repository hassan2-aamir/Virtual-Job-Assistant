import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

type UserRole = "employee" | "employer";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/signup', { name, email, password, role });
      const newUser = response.data; // Assuming the backend returns the user data
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/signin', { name: email, password });
      const loggedInUser = response.data; // Assuming the backend returns the user data and access token
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const switchRole = () => {
    if (!user) return;

    const newRole = user.role === "employee" ? "employer" : "employee";
    const updatedUser = { ...user, role: newRole };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
