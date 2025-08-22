'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Interfaces ---
export interface User {
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
  login: (credentials: { email: string; password: string; csrfToken: string | null }) => Promise<any>;
  register: (userData: RegisterData & { csrfToken: string | null }) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<any>;
  refetchUser: () => void;
  csrfToken: string | null;
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

// --- React Query Setup ---
const queryKeys = {
  user: ['user'] as const,
  csrfToken: ['csrfToken'] as const,
};

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
    // Przekazujemy całe 'data' dalej, aby mieć dostęp do 'newCsrfToken'
    const error: any = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.data = data; // Dołączamy całą odpowiedź do obiektu błędu
    throw error;
  }
  return data;
};

const fetchUser = async (): Promise<User | null> => {
  try {
    const data = await apiCall('/api/auth/me');
    return data.user || null;
  } catch (error: any) {
    if (error.message.includes('401')) {
      return null;
    }
    throw error;
  }
};

const fetchCsrfToken = async () => {
    const data = await apiCall('/api/auth/csrf-token');
    return data.token;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);
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

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: queryKeys.user,
    queryFn: fetchUser,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: csrfToken } = useQuery({
    queryKey: queryKeys.csrfToken,
    queryFn: fetchCsrfToken,
    staleTime: 1000 * 60 * 15,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => error.message?.includes('401') ? false : true,
  });

  const isAuthenticated = !!user;

  // --- Mutations ---

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string; csrfToken: string | null }) =>
      apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        headers: {
          'X-CSRF-Token': credentials.csrfToken,
        },
      }),
    onSuccess: async (data) => {
      if (data?.user || data?.id) {
          queryClient.setQueryData(queryKeys.user, data.user || data);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.user });
      await queryClient.invalidateQueries({ queryKey: queryKeys.csrfToken });
    },
    onError: (error: any) => {
      if (error.data?.newCsrfToken) {
        queryClient.setQueryData(queryKeys.csrfToken, error.data.newCsrfToken);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.csrfToken });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData & { csrfToken: string | null }) =>
      apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'X-CSRF-Token': userData.csrfToken
        }
      }),
    onSuccess: async (data) => {
      if (data?.user || data?.id) {
          queryClient.setQueryData(queryKeys.user, data.user || data);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.user });
      await queryClient.invalidateQueries({ queryKey: queryKeys.csrfToken });
    },
    onError: (error: any) => {
      if (error.data?.newCsrfToken) {
        queryClient.setQueryData(queryKeys.csrfToken, error.data.newCsrfToken);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.csrfToken });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: (csrfTokenValue: string | null) => {
      if (!csrfTokenValue) {
        throw new Error('CSRF token is missing.');
      }
      return apiCall('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfTokenValue,
        },
      });
    },
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.user, null);
      await queryClient.refetchQueries({ queryKey: queryKeys.csrfToken });
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
    login: (credentials) => loginMutation.mutateAsync({ ...credentials, csrfToken }),
    register: (userData) => registerMutation.mutateAsync({ ...userData, csrfToken }),
    logout: () => logoutMutation.mutateAsync(csrfToken),
    updateUser: updateUserMutation.mutateAsync,
    refetchUser: refetch,
    csrfToken: csrfToken ?? null,
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
