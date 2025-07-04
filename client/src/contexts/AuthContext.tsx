import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";

// Define types for the auth context
interface User {
  id: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
  skillType?: string;
  country?: string;
  personalGoal?: string;
  website?: string;
  followers: number;
  following: number;
  points: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for fallback when API is not available
const mockUser: User = {
  id: "user1",
  email: "user@example.com",
  fullName: "Alex Johnson",
  profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  bio: "Passionate guitarist and music producer with 5 years of experience. Love sharing my skills and learning from others.",
  skillType: "Music",
  country: "United States",
  website: "https://alexjohnson.example.com",
  followers: 245,
  following: 132,
  points: 1850
};

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    setIsMounted(true);
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          const response = await api.get('/auth/me');
          if (isMounted && response.data.data) {
            setUser(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    };

    checkLoggedIn();

    return () => {
      setIsMounted(false);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Fetch user data
        const userResponse = await api.get('/auth/me');
        if (isMounted && userResponse.data.data) {
          setUser(userResponse.data.data);
          toast.success("Login successful!");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fallback to mock user for development
      if (process.env.NODE_ENV === 'development') {
        setUser(mockUser);
        toast.success("Development mode: Using mock user data");
      } else {
        throw error;
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name: fullName 
      });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Fetch user data
        const userResponse = await api.get('/auth/me');
        if (isMounted && userResponse.data.data) {
          setUser(userResponse.data.data);
          toast.success("Account created successfully!");
        }
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Fallback to mock user for development
      if (process.env.NODE_ENV === 'development') {
        setUser({
          ...mockUser,
          email,
          fullName,
          followers: 0,
          following: 0,
          points: 0
        });
        toast.success("Development mode: Using mock user data");
      } else {
        throw error;
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
      setIsLoading(true);
      try {
        const response = await api.put(`/users/${user.id}`, data);
        if (response.data.success && isMounted) {
          setUser({ ...user, ...data });
          toast.success("Profile updated successfully");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        // Fallback for development
        if (process.env.NODE_ENV === 'development') {
          setUser({ ...user, ...data });
          toast.success("Development mode: Profile updated with mock data");
        } else {
          toast.error("Failed to update profile");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
