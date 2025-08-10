'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomerProfile from '@/components/profiles/CustomerProfile';
import TeammateProfile from '@/components/profiles/TeammateProfile';
import AdminProfile from '@/components/profiles/AdminProfile';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [user, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render different profile components based on user type
  switch (user.userType) {
    case 'customer':
      return <CustomerProfile user={user} />;
    case 'teammate':
      return <TeammateProfile user={user} />;
    case 'admin':
      return <AdminProfile user={user} />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid User Type</h1>
            <p className="text-gray-600">Please contact support.</p>
          </div>
        </div>
      );
  }
}