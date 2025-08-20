'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OnlineStatus from '@/components/OnlineStatus';
import IncomingOrders from '@/components/IncomingOrders';
import WeeklyStats from '@/components/WeeklyStats';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalPayment: 0,
    orders: 0,
    winRate: 0,
    leaderboardPosition: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role === 'customer') {
      router.push('/profile/customer');
      return;
    }

    if (user && (user.role === 'teammate' || user.role === 'administrator')) {
      fetchDashboardData();
    }
  }, [user, isLoading, isAuthenticated, router]);

  const fetchDashboardData = async () => {
    // Fetching dashboard data logic...
  };

  const handleToggleOnline = () => {
    // Logic for toggling online/offline...
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <DashboardHeader />
        <div className="flex gap-8">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <OnlineStatus isOnline={isOnline} onToggle={handleToggleOnline} />
                <IncomingOrders orders={incomingOrders} onAccept={() => {}} onReject={() => {}} isOnline={isOnline} />
                <WeeklyStats {...weeklyStats} />
              </div>
            )}
            {/* Similar for other tabs like 'order-history', 'quest', 'teammate-rules' */}
          </div>
        </div>
      </div>
    </div>
  );
}