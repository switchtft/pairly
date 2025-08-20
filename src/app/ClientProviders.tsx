'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResponsiveNavbar />
        <main className="flex-grow pt-24 pb-8">{children}</main>
        <Footer />
        <ScrollToTop />
      </AuthProvider>
    </QueryClientProvider>
  );
}