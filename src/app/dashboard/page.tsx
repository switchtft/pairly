'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedPage from '@/components/ProtectedPage'; // Importujemy komponent chroniący
import OnlineStatus from '@/components/OnlineStatus';
import IncomingOrders from '@/components/IncomingOrders';
import WeeklyStats from '@/components/WeeklyStats';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';

const DashboardContent = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    // ProtectedPage zajął się już sprawdzeniem, czy użytkownik jest zalogowany.
    // Tutaj obsługujemy tylko logikę specyficzną dla ról.
    if (user) {
      if (user.role === 'customer') {
        router.push('/profile/customer');
        return;
      }
      
      if (user.role === 'teammate' || user.role === 'administrator') {
        fetchDashboardData();
      }
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    // Tutaj umieść logikę pobierania danych z API dla dashboardu.
    // Na przykład:
    // const response = await fetch('/api/dashboard/stats');
    // const data = await response.json();
    // setWeeklyStats(data.stats);
    // setIncomingOrders(data.orders);
  };

  const handleToggleOnline = () => {
    // Tutaj umieść logikę do zmiany statusu online/offline i wysłania jej do API.
    setIsOnline(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ResponsiveNavbar />
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
            {/* Tutaj możesz dodać widoki dla innych zakładek, np. 'order-history' */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Główny eksport strony, która jest chroniona
export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardContent />
    </ProtectedPage>
  );
}
