import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { createUser, loginUser, switchUserRole } from "../../lib/api"; // Importing the functions
import { useNavigate } from 'react-router-dom';  // Add this import
import { changePassword } from "../../lib/api"; // Import the new function
export type UserRole = "employee" | "employer"; // Updated to use string values

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
  switchRole: () => Promise<void>;
  handleChangePassword: (currentPassword: string, newPassword: string) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


    // Initialize useNavigate hook
    const navigate = useNavigate();



  
  // Check for the stored user data on component mount
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
      const response = await createUser({ name, email, password, role });
      const newUser = response; // Assuming the backend response is directly the user object
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser)); // Save user data to localStorage
    } catch (error) {
      console.error("Registration failed:", error);
      throw error; // Handle registration error
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Use the new loginUser function
      const response = await loginUser(email, password);
      
      // Debug: Log the response
      console.log("Login response:", response);
      
      // Extract user and token from response
      const { user: loggedInUser, token } = response;
      
      // Debug: Log the loggedInUser and the expected role
      console.log("Logged in user:", loggedInUser);
      console.log("Expected role:", role);
      
      // Save token to localStorage
      if (token) {
        localStorage.setItem("token", token);
      } else {
        console.error("No token received from server");
      }
  
      // Verify role matches requested role
      if (loggedInUser.role !== role) {
        throw new Error(`You don't have ${role} access. Please use the correct account type.`);
      }
      
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      
      // Debug: Log when the user is set successfully
      console.log("User logged in and role is correct.");
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
    localStorage.removeItem("token"); // Clear token
    window.location.href = "/"; // Redirect to login
  };
 

  const switchRole = async () => {
    if (!user) return;
  
    // Only switch role if the current role is not the same as the requested one
    const newRole: UserRole = user.role === "employee" ? "employer" : "employee";
  
    // Prevent switching to the same role
    if (user.role === newRole) {
      alert(`You are already logged in as an ${newRole}.`);
      return;
    }
  
    try {
      const updatedUser = await switchUserRole(user.id, newRole);
      setUser(updatedUser); // Update user state
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Save updated user in localStorage
  
      alert("ROLE HAS BEEN SWITCHED SUCCESSFULLY. You will be logged out.");
      logout(); // Log out the user after switching roles

  
      navigate("/");
      
    } catch (error) {
      console.error('Failed to switch role:', error); // Log the error if the API call fails
      alert("Failed to switch role. Please try again later.");
    }
  };
  
  

  async function handleChangePassword(currentPassword: string, newPassword: string) {
    try {
      await changePassword(currentPassword, newPassword);
      return Promise.resolve(); // Return successful promise for the component to handle
    } catch (error: any) {
      return Promise.reject(error); // Return the error for the component to handle
    }
  }
  
  
  // Find the return statement in AuthProvider (around line 150)
return (
  <AuthContext.Provider value={{ 
    user, 
    isLoading, 
    register, 
    login, 
    logout, 
    switchRole,
    handleChangePassword // Add this line
  }}>
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
