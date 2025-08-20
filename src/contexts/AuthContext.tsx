'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      if (!mounted) return null;
      
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Ważne: to wysyła cookies
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.user;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    enabled: mounted,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Ważne: pozwala na ustawienie cookies
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      
      return await loginMutation.mutateAsync({ 
        email: userData.email, 
        password: userData.password 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      }
    },
    onMutate: async () => {
      // natychmiastowe usunięcie danych użytkownika z pamięci podręcznej
      queryClient.setQueryData(['user'], null);
    },
    onSettled: () => {
      // usuwanie danych użytkownika z cache
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const handleLogin = useCallback(async (credentials: { email: string; password: string }) => {
    return await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const handleRegister = useCallback(async (userData: RegisterData) => {
    return await registerMutation.mutateAsync(userData);
  }, [registerMutation]);

  const handleLogout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(['user'], null);  // Usunięcie danych użytkownika z cache po wylogowaniu
  }, [logoutMutation, queryClient]);

  const handleUpdateUser = useCallback(async (userData: Partial<User>) => {
    return await updateUserMutation.mutateAsync(userData);
  }, [updateUserMutation]);

  const value = {
    user,
    isLoading: !mounted || isLoading,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
