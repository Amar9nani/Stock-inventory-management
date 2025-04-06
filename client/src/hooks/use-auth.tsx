import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type RegisterData = InsertUser;

// Create context with default value to avoid null checks
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as any,
  logoutMutation: {} as any,
  registerMutation: {} as any
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login submission:", credentials);
      
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Login failed" }));
          throw new Error(errorData.message || "Login failed");
        }
        
        const userData = await res.json();
        return userData;
      } catch (error) {
        console.error("Login error:", error);
        throw error instanceof Error ? error : new Error("Login failed");
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      // Invalidate other queries that might need refresh with new auth state
      queryClient.invalidateQueries({queryKey: ["/api/products"]});
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log("Registration submission:", { ...credentials, password: "••••••••" });
      
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Registration failed" }));
          throw new Error(errorData.message || "Registration failed");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error instanceof Error ? error : new Error("Registration failed");
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      // Invalidate other queries that might need refresh with new auth state
      queryClient.invalidateQueries({queryKey: ["/api/products"]});
      
      toast({
        title: "Registration successful",
        description: `Welcome to Stock Manager, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
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

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}