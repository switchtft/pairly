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
  XCircle,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';

type TabType = 'dashboard' | 'order-history' | 'quest' | 'teammate-rules';

interface IncomingOrder {
  id: number;
  clientId: number;
  clientName: string;
  clientAvatar?: string;
  game: string;
  mode: string;
  duration: number;
  price: number;
  createdAt: string;
}

interface OrderHistoryItem {
  id: number;
  clientId: number;
  clientName: string;
  clientAvatar?: string;
  game: string;
  mode: string;
  result: 'win' | 'loss' | 'draw';
  price: number;
  createdAt: string;
  status: 'completed' | 'pending' | 'cancelled';
  payoutRequested: boolean;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  reward: number;
  progress: number;
  maxProgress: number;
  status: 'active' | 'completed' | 'locked';
  type: 'orders' | 'rating' | 'streak' | 'earnings';
}

interface WeeklyStats {
  totalPayment: number;
  orders: number;
  winRate: number;
  leaderboardPosition: number;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalPayment: 0,
    orders: 0,
    winRate: 0,
    leaderboardPosition: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only customers are restricted from accessing the dashboard
    if (user && user.role === 'customer') {
      router.push('/profile/customer');
      return;
    }

    // Administrators and teammates can access the dashboard
    if (user && (user.role === 'teammate' || user.role === 'administrator')) {
      fetchDashboardData();
    }
  }, [user, isLoading, isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teammate status and stats
      const statsResponse = await fetch('/api/teammates/stats', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setWeeklyStats(statsData.weeklyStats);
        setIsOnline(statsData.isOnline);
      }

      // Fetch incoming orders
      const ordersResponse = await fetch('/api/teammates/incoming-orders', {
        credentials: 'include'
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setIncomingOrders(ordersData.orders);
      }

      // Fetch order history
      const historyResponse = await fetch('/api/teammates/order-history', {
        credentials: 'include'
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setOrderHistory(historyData.orders);
      }

      // Fetch quests
      const questsResponse = await fetch('/api/teammates/quests', {
        credentials: 'include'
      });
      
      if (questsResponse.ok) {
        const questsData = await questsResponse.json();
        setQuests(questsData.quests);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const response = await fetch('/api/teammates/toggle-online', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isOnline: !isOnline })
      });

      if (response.ok) {
        setIsOnline(!isOnline);
        // Refresh incoming orders when going online
        if (!isOnline) {
          fetchDashboardData();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update online status');
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
      setError('Failed to update online status');
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await fetch('/api/teammates/accept-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        // Remove from incoming orders
        setIncomingOrders(prev => prev.filter(order => order.id !== orderId));
        // Refresh data
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
      setError('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      const response = await fetch('/api/teammates/reject-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        // Remove from incoming orders
        setIncomingOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
      setError('Failed to reject order');
    }
  };

  const handleRequestPayout = async (orderId: number) => {
    try {
      const response = await fetch('/api/teammates/request-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        // Update order status
        setOrderHistory(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, payoutRequested: true }
            : order
        ));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Failed to request payout:', error);
      setError('Failed to request payout');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'loss': return 'text-red-400';
      case 'draw': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getQuestProgress = (quest: Quest) => {
    return Math.min((quest.progress / quest.maxProgress) * 100, 100);
  };

  const getQuestStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-blue-500';
      case 'completed': return 'border-green-500';
      case 'locked': return 'border-gray-500';
      default: return 'border-gray-500';
    }
  };

  if (isLoading || loading) {
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
      {/* Online Status */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Online Status</h2>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-white">{isOnline ? 'Online' : 'Offline'}</span>
          <Button
            onClick={handleToggleOnline}
            className={`ml-auto ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isOnline ? <WifiOff size={16} className="mr-2" /> : <Wifi size={16} className="mr-2" />}
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
        {!isOnline && (
          <p className="text-gray-400 text-sm mt-2">
            <AlertCircle size={14} className="inline mr-1" />
            You need to be online to receive orders
          </p>
        )}
      </div>

      {/* Incoming Orders */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Incoming Orders</h2>
          <Link href="/teammate-rules" className="text-[#e6915b] hover:text-[#d18251] text-sm">
            View Teammate Rules →
          </Link>
        </div>
        <div className="space-y-4">
          {incomingOrders.length > 0 ? (
            incomingOrders.map((order) => (
              <div key={order.id} className="p-4 bg-[#2a2a2a] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e6915b] rounded-full flex items-center justify-center">
                      {order.clientAvatar ? (
                        <img 
                          src={order.clientAvatar} 
                          alt={order.clientName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {order.clientName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.clientName}</p>
                      <p className="text-gray-400 text-sm">{order.game} - {order.mode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">${order.price.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">{order.duration}min</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    className="bg-green-500 hover:bg-green-600 flex-1"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Accept
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 flex-1"
                    onClick={() => handleRejectOrder(order.id)}
                  >
                    <XCircle size={16} className="mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="mx-auto mb-4" size={48} />
              <p>No incoming orders</p>
              <p className="text-sm">
                {isOnline 
                  ? 'Orders will appear here when customers request your services'
                  : 'Go online to start receiving orders'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Weekly Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">${weeklyStats.totalPayment.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Total Payment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{weeklyStats.orders}</p>
            <p className="text-gray-400 text-sm">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{weeklyStats.winRate}%</p>
            <p className="text-gray-400 text-sm">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">#{weeklyStats.leaderboardPosition}</p>
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
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
                <div className="text-gray-400 text-sm min-w-[140px]">
                  {formatDate(order.createdAt)}
                </div>
                <div className="w-8 h-8 bg-[#e6915b] rounded-full flex items-center justify-center">
                  {order.clientAvatar ? (
                    <img 
                      src={order.clientAvatar} 
                      alt={order.clientName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {order.clientName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{order.clientName}</p>
                  <p className="text-gray-400 text-sm">{order.game} - {order.mode}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${getResultColor(order.result)}`}>
                    {order.result.toUpperCase()}
                  </p>
                </div>
                <div className="text-green-400 font-bold">${order.price.toFixed(2)}</div>
                <Button 
                  className={`${order.payoutRequested ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#e6915b] hover:bg-[#d18251]'}`}
                  disabled={order.payoutRequested}
                  onClick={() => handleRequestPayout(order.id)}
                >
                  {order.payoutRequested ? 'Payout Requested' : 'Request payout'}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <History className="mx-auto mb-4" size={48} />
              <p>No order history yet</p>
              <p className="text-sm">Complete orders to see your history here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuestTab = () => (
    <div className="space-y-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Available Quests</h2>
        <div className="space-y-4">
          {quests.length > 0 ? (
            quests.map((quest) => (
              <div key={quest.id} className={`p-4 bg-[#2a2a2a] rounded-lg border-l-4 ${getQuestStatusColor(quest.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{quest.title}</h3>
                    <p className="text-gray-400 text-sm">{quest.description}</p>
                    <p className="text-yellow-400 text-sm mt-1">Reward: {quest.reward} leaderboard points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{quest.progress}/{quest.maxProgress}</p>
                    <div className="w-20 bg-[#1a1a1a] rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          quest.status === 'completed' ? 'bg-green-500' : 
                          quest.status === 'active' ? 'bg-[#e6915b]' : 'bg-gray-500'
                        }`} 
                        style={{width: `${getQuestProgress(quest)}%`}}
                      ></div>
                    </div>
                    <p className={`text-sm ${
                      quest.status === 'completed' ? 'text-green-400' : 
                      quest.status === 'active' ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {quest.status === 'completed' ? 'Completed' : 
                       quest.status === 'active' ? 'Active' : 'Locked'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="mx-auto mb-4" size={48} />
              <p>No quests available</p>
              <p className="text-sm">Complete more orders to unlock quests!</p>
            </div>
          )}
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
                         <p className="text-gray-400 text-sm">Provide high-quality coaching and gameplay. Focus on improving the customer&apos;s skills and experience.</p>
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

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">7. Online Status</h3>
                         <p className="text-gray-400 text-sm">Keep your online status accurate. Only go online when you&apos;re available to accept orders.</p>
          </div>

          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <h3 className="text-white font-medium mb-2">8. Order Management</h3>
            <p className="text-gray-400 text-sm">Respond to incoming orders promptly. Accept or decline within a reasonable time frame.</p>
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
                  Quests
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

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
            <p>{error}</p>
            <Button 
              size="sm" 
              className="ml-2 bg-red-600 hover:bg-red-700"
              onClick={() => setError(null)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}