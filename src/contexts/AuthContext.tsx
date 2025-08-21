'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Interfaces ---
interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  game?: string;
  role?: string;
  rank?: string;
  isPro: boolean;
  verified: boolean;
  discord?: string;
  steam?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  lastSeen: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<any>;
  refetchUser: () => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  game?: string;
  role?: string;
}

// --- API Helper Functions ---
const apiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
};

const fetchUser = async (): Promise<User | null> => {
  try {
    const data = await apiCall('/api/auth/me');
    return data.user || null;
  } catch (error) {
    // It's normal for this to fail if the user is not logged in.
    return null;
  }
};

// --- React Query Setup ---
const queryKeys = {
  user: ['user'] as const,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a client
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    )
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // useQuery is the single source of truth for user data.
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: queryKeys.user,
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Derived state is simpler and more direct.
  const isAuthenticated = !!user;

  // --- Mutations ---

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) =>
      apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      // After successful registration, log the user in by setting the user data.
      queryClient.setQueryData(queryKeys.user, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiCall('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      // On successful logout, clear the user data from the cache.
      queryClient.setQueryData(queryKeys.user, null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) =>
      apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data.user);
    },
  });

  const contextValue: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
