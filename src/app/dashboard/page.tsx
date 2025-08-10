// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Users, 
  Trophy, 
  Star, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
  Gamepad2,
  Crown,
  Shield,
  History,
  BookOpen,
  Settings,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

type TabType = 'dashboard' | 'order-history' | 'quest' | 'teammate-rules';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  if (!user) return null;

  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Online Status</h2>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-white">{isOnline ? 'Online' : 'Offline'}</span>
          <Button
            onClick={() => setIsOnline(!isOnline)}
            className={`ml-auto ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Incoming Orders</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e6915b] rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">JohnDoe123</p>
                  <p className="text-gray-400 text-sm">Valorant - Ranked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">$15.00</p>
                <p className="text-gray-400 text-sm">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button className="bg-green-500 hover:bg-green-600 flex-1">
                <CheckCircle size={16} className="mr-2" />
                Accept
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 flex-1">
                <XCircle size={16} className="mr-2" />
                Decline
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6b8ab0] rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">GamerGirl456</p>
                  <p className="text-gray-400 text-sm">CS:GO - Casual</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">$12.50</p>
                <p className="text-gray-400 text-sm">1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button className="bg-green-500 hover:bg-green-600 flex-1">
                <CheckCircle size={16} className="mr-2" />
                Accept
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 flex-1">
                <XCircle size={16} className="mr-2" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Weekly Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">$245.75</p>
            <p className="text-gray-400 text-sm">Total Payment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">18</p>
            <p className="text-gray-400 text-sm">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">78%</p>
            <p className="text-gray-400 text-sm">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">#12</p>
            <p className="text-gray-400 text-sm">Leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderHistoryTab = () => (
    <div className="space-y-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Order History</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
            <div className="text-gray-400 text-sm">08/07/2025 - 3:24 am</div>
            <div className="w-8 h-8 bg-[#e6915b] rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">JohnDoe123</p>
              <p className="text-gray-400 text-sm">Valorant - Ranked</p>
            </div>
            <div className="text-center">
              <p className="text-white">0W - 0L</p>
            </div>
            <div className="text-green-400 font-bold">$4.85</div>
            <Button className="bg-[#e6915b] hover:bg-[#d18251]">
              Request payout
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
            <div className="text-gray-400 text-sm">07/07/2025 - 8:15 pm</div>
            <div className="w-8 h-8 bg-[#6b8ab0] rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">GamerGirl456</p>
              <p className="text-gray-400 text-sm">CS:GO - Casual</p>
            </div>
            <div className="text-center">
              <p className="text-white">2W - 1L</p>
            </div>
            <div className="text-green-400 font-bold">$12.50</div>
            <Button className="bg-[#e6915b] hover:bg-[#d18251]">
              Request payout
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
            <div className="text-gray-400 text-sm">06/07/2025 - 2:30 pm</div>
            <div className="w-8 h-8 bg-[#e6915b] rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">ProPlayer789</p>
              <p className="text-gray-400 text-sm">League of Legends - Ranked</p>
            </div>
            <div className="text-center">
              <p className="text-white">1W - 2L</p>
            </div>
            <div className="text-green-400 font-bold">$18.75</div>
            <Button className="bg-[#e6915b] hover:bg-[#d18251]">
              Request payout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestTab = () => (
    <div className="space-y-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Available Quests</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#2a2a2a] rounded-lg border-l-4 border-[#e6915b]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Complete 10 Orders</h3>
                <p className="text-gray-400 text-sm">Complete 10 orders this week</p>
                <p className="text-yellow-400 text-sm mt-1">Reward: 50 leaderboard points</p>
              </div>
              <div className="text-right">
                <p className="text-white">7/10</p>
                <div className="w-20 bg-[#1a1a1a] rounded-full h-2 mt-1">
                  <div className="bg-[#e6915b] h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg border-l-4 border-[#6b8ab0]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Maintain 4.5+ Rating</h3>
                <p className="text-gray-400 text-sm">Keep average rating above 4.5 for 7 days</p>
                <p className="text-yellow-400 text-sm mt-1">Reward: 100 leaderboard points</p>
              </div>
              <div className="text-right">
                <p className="text-white">4.8</p>
                <p className="text-green-400 text-sm">Active</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Win Streak</h3>
                <p className="text-gray-400 text-sm">Win 5 consecutive games</p>
                <p className="text-yellow-400 text-sm mt-1">Reward: 75 leaderboard points</p>
              </div>
              <div className="text-right">
                <p className="text-white">3/5</p>
                <p className="text-blue-400 text-sm">In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeammateRulesTab = () => (
    <div className="space-y-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Teammate Rules</h2>
        <div className="space-y-4">
          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">1. Professional Conduct</h3>
            <p className="text-gray-400 text-sm">Always maintain professional behavior during sessions. No toxic language, harassment, or inappropriate conduct.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">2. Session Quality</h3>
            <p className="text-gray-400 text-sm">Provide high-quality coaching and gameplay. Focus on improving the customer's skills and experience.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">3. Communication</h3>
            <p className="text-gray-400 text-sm">Maintain clear and timely communication with customers. Respond to messages promptly and professionally.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">4. Punctuality</h3>
            <p className="text-gray-400 text-sm">Be on time for scheduled sessions. If you need to cancel, provide at least 24 hours notice.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">5. Payment & Payouts</h3>
            <p className="text-gray-400 text-sm">Complete sessions properly to receive payment. Request payouts through the dashboard after session completion.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">6. Platform Guidelines</h3>
            <p className="text-gray-400 text-sm">Follow all platform guidelines and terms of service. Violations may result in account suspension.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'order-history':
        return renderOrderHistoryTab();
      case 'quest':
        return renderQuestTab();
      case 'teammate-rules':
        return renderTeammateRulesTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Teammate Dashboard
          </h1>
          <p className="text-gray-400">Manage your orders, track performance, and grow your business</p>
        </div>

        <div className="flex gap-8">
          {/* Left Info Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-[#e6915b] rounded-full flex items-center justify-center mx-auto mb-3">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-white font-bold text-lg">{getDisplayName()}</h2>
                <p className="text-gray-400">@{user.username}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white flex items-center">
                    ⭐ 5.00 (27)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sessions:</span>
                  <span className="text-white">71</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`flex items-center ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} mr-2`}></div>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Button Menu */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-4">
              <div className="space-y-2">
                <Button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full justify-start ${activeTab === 'dashboard' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
                >
                  <Gamepad2 size={16} className="mr-3" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => setActiveTab('order-history')}
                  className={`w-full justify-start ${activeTab === 'order-history' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
                >
                  <History size={16} className="mr-3" />
                  Order History
                </Button>
                <Button
                  onClick={() => setActiveTab('quest')}
                  className={`w-full justify-start ${activeTab === 'quest' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
                >
                  <Trophy size={16} className="mr-3" />
                  Quest Button
                </Button>
                <Button
                  onClick={() => setActiveTab('teammate-rules')}
                  className={`w-full justify-start ${activeTab === 'teammate-rules' ? 'bg-[#e6915b] hover:bg-[#d18251]' : 'bg-transparent hover:bg-[#2a2a2a]'}`}
                >
                  <BookOpen size={16} className="mr-3" />
                  Teammate Rules
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}