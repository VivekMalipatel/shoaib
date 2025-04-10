import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a default value for the AuthContext to avoid null check
const defaultValue = {
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as UseMutationResult<SelectUser, Error, LoginData>,
  logoutMutation: {} as UseMutationResult<void, Error, void>,
  registerMutation: {} as UseMutationResult<SelectUser, Error, InsertUser>,
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

// Create the Auth context with a default value
export const AuthContext = createContext<AuthContextType>(defaultValue);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // First try Flask backend
        try {
          const { getCurrentUser } = await import('../lib/flaskApi');
          const user = await getCurrentUser();
          console.log('Get current user success with Flask API:', user);
          return user;
        } catch (flaskError) {
          console.warn('Flask get user failed, falling back to Express:', flaskError);
          
          // Fall back to Express backend
          // Fall back to Express backend
          const expressQueryFn = getQueryFn({ on401: "returnNull" });
          return await expressQueryFn({ queryKey: ["/api/user"] } as any);
        }
      } catch (error) {
        console.error('Get user error:', error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('Login attempt:', credentials.username);
      try {
        // First try Flask backend
        try {
          // Use the Flask API
          const { loginWithFlask } = await import('../lib/flaskApi');
          const userData = await loginWithFlask(credentials.username, credentials.password);
          console.log('Login success with Flask API:', userData);
          return userData;
        } catch (flaskError) {
          console.warn('Flask login failed, falling back to Express:', flaskError);
          
          // Fall back to Express backend
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });
          
          // Check for errors
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Login server error:', res.status, errorText);
            throw new Error(errorText || "Login failed");
          }
          
          // Parse the response
          const userData = await res.json();
          console.log('Login success with Express API:', userData);
          return userData;
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log('Setting user data in query cache:', user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}`,
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation error handler:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      try {
        // First try Flask backend
        try {
          // Use the Flask API
          const { registerWithFlask } = await import('../lib/flaskApi');
          const user = await registerWithFlask(userData);
          console.log('Registration success with Flask API:', user);
          return user;
        } catch (flaskError) {
          console.warn('Flask registration failed, falling back to Express:', flaskError);
          
          // Fall back to Express backend
          const res = await apiRequest("POST", "/api/register", userData);
          const user = await res.json();
          console.log('Registration success with Express API:', user);
          return user;
        }
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to MediConnect, ${user.fullName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // First try Flask backend
        try {
          // Use the Flask API
          const { logoutFromFlask } = await import('../lib/flaskApi');
          await logoutFromFlask();
          console.log('Logout success with Flask API');
        } catch (flaskError) {
          console.warn('Flask logout failed, falling back to Express:', flaskError);
          
          // Fall back to Express backend
          await apiRequest("POST", "/api/logout");
          console.log('Logout success with Express API');
        }
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Value to provide to consumers
  const value = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
