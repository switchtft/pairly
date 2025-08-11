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
      switch (user.role) {
        case 'administrator':
          router.push('/profile/administrator');
          break;
        case 'teammate':
          router.push('/profile/teammate');
          break;
        case 'customer':
        default:
          router.push('/profile/customer');
          break;
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading while determining route
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
    </div>
  );
}