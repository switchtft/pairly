// @/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LayoutProvider } from '@/app/contexts/LayoutContext';
import { NotificationProvider } from '@/contexts/NotificationContext'; // <-- Dodany import
import React from 'react';

// Inicjalizujemy klienta raz, poza komponentem
const queryClient = new QueryClient();

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    // Każdy kolejny provider "opakowuje" poprzedniego
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </LayoutProvider>
    </QueryClientProvider>
  );
}
