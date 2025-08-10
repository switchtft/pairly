// src/app/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // Route to appropriate profile based on user role
      // For Phase 1, we'll use placeholder logic
      // In future phases, this will be based on actual user role from database
      
      // For now, redirect to customer profile as default
      // This will be updated in Phase 3 when we implement role-based routing
      router.push('/profile/customer');
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading while determining route
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
    </div>
  );
}