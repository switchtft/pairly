'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { LayoutProvider } from '@/app/contexts/LayoutContext';

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutProvider>
        <AuthProvider>
          <main className="flex-grow pt-24 pb-8">{children}</main>
          <ScrollToTop />
        </AuthProvider>
      </LayoutProvider>
    </QueryClientProvider>
  );
}
