'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeammateDashboardProps {
  user: { id: number; username: string; email: string; userType: string; game?: string }; // Will be properly typed later
}

export default function TeammateDashboard({ user }: TeammateDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [liveOrders, setLiveOrders] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalPayment: 0,
    numberOfOrders: 0,
    winRate: 0
  });
  const [leaderboardPosition, setLeaderboardPosition] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  const [availableQuests, setAvailableQuests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data from API
      const response = await fetch('/api/teammates/dashboard');
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.onlineStatus);
        setWeeklyStats(data.weeklyStats);
        setLeaderboardPosition(data.leaderboardPosition);
        setOrderHistory(data.orderHistory);
        setAvailableQuests(data.availableQuests);
      }
      
      // Fetch live orders
      const liveOrdersResponse = await fetch('/api/teammates/live-orders');
      if (liveOrdersResponse.ok) {
        const liveOrdersData = await liveOrdersResponse.json();
        setLiveOrders(liveOrdersData.orders);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch('/api/teammates/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: !isOnline }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.onlineStatus);
      }
    } catch (error) {
      console.error('Failed to toggle online status:', error);
    }
  };

  const acceptOrder = async (orderId: number) => {
    try {
      const response = await fetch('/api/teammates/live-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, action: 'accept' }),
      });
      
      if (response.ok) {
        // Refresh live orders and dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
    }
  };

  const rejectOrder = async (orderId: number) => {
    try {
      const response = await fetch('/api/teammates/live-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, action: 'reject' }),
      });
      
      if (response.ok) {
        // Refresh live orders
        const liveOrdersResponse = await fetch('/api/teammates/live-orders');
        if (liveOrdersResponse.ok) {
          const liveOrdersData = await liveOrdersResponse.json();
          setLiveOrders(liveOrdersData.orders);
        }
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  };

  const requestPayout = async () => {
    try {
      const response = await fetch('/api/teammates/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 'all' }), // Request all available amount
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Payout request submitted successfully! Amount: $${data.amount}`);
        // Refresh dashboard data to update unpaid amount
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to request payout: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to request payout:', error);
      alert('Failed to request payout. Please try again.');
    }
  };

  const completeQuest = async (questId: number) => {
    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Quest completed! You earned ${data.pointsEarned} points!`);
        // Refresh dashboard data to update quests and leaderboard position
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to complete quest: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
      alert('Failed to complete quest. Please try again.');
    }
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Go Online Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            <p className="text-sm text-gray-600">Go online to receive orders</p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isOnline
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Live Orders Feed */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Orders</h3>
        {liveOrders.length > 0 ? (
          <div className="space-y-4">
            {liveOrders.map((order: { id: number; customerName: string; gameType: string; duration: string; price: number }) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {order.customerName[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                      <p className="text-sm text-gray-600">{order.gameType} • {order.duration}</p>
                      <p className="text-lg font-bold text-green-600">${order.price}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectOrder(order.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No live orders available.</p>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week&apos;s Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">${weeklyStats.totalPayment}</div>
            <div className="text-sm text-gray-600">Total Payment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{weeklyStats.numberOfOrders}</div>
            <div className="text-sm text-gray-600">Number of Orders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{weeklyStats.winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Position */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard Position</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-600 mb-2">#{leaderboardPosition}</div>
          <p className="text-gray-600">Keep up the great work!</p>
        </div>
      </div>
    </div>
  );

  const renderOrderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
          <button
            onClick={requestPayout}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Request Payout
          </button>
        </div>
        
        {orderHistory.length > 0 ? (
          <div className="space-y-4">
            {orderHistory.map((order: { id: number; customerName: string; gameType: string; duration: string; price: number; status: string; completedAt: string }) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {order.customerName[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{order.date} - {order.time}</span>
                        <span className="text-sm font-medium">{order.customerName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{order.gameType}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          order.result === 'W' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.result === 'W' ? 'WIN' : 'LOSS'}
                        </span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-lg font-bold text-green-600">${order.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No order history yet.</p>
        )}
      </div>
    </div>
  );

  const renderQuestsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Quests</h3>
        
        {availableQuests.length > 0 ? (
          <div className="space-y-4">
            {availableQuests.map((quest: { id: number; title: string; description: string; points: number; progress: number; target: number; isCompleted: boolean }) => (
              <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{quest.title}</h4>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    {quest.points} pts
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {quest.progress}/{quest.target}
                    </span>
                    {quest.progress >= quest.target && !quest.isCompleted && (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                    {quest.isCompleted && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No quests available.</p>
        )}
      </div>
    </div>
  );

  const renderTeammateRulesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Teammate Rules</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900">Professional Conduct</h4>
            <p className="text-sm text-gray-600">Always maintain professional behavior with customers and other teammates.</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900">Order Completion</h4>
            <p className="text-sm text-gray-600">Complete all accepted orders to the best of your ability and within the agreed timeframe.</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900">Communication</h4>
            <p className="text-sm text-gray-600">Maintain clear and timely communication with customers throughout the order process.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-gray-900">Fair Play</h4>
            <p className="text-sm text-gray-600">Ensure all gameplay follows fair play guidelines and platform rules.</p>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-gray-900">Payment & Payouts</h4>
            <p className="text-sm text-gray-600">Request payouts only after completing orders and following platform payment policies.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <p className="text-gray-600 mb-4">Manage your profile information and preferences.</p>
        <button
          onClick={() => router.push('/profile')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Profile
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'orderHistory':
        return renderOrderHistoryTab();
      case 'quests':
        return renderQuestsTab();
      case 'rules':
        return renderTeammateRulesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            {/* Rating and Sessions */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="text-2xl font-bold text-gray-900">5.00</span>
                <span className="text-gray-600">(27)</span>
              </div>
              <div className="text-sm text-gray-600">Sessions: 71</div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              
              <button
                onClick={() => setActiveTab('orderHistory')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'orderHistory'
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Order History
              </button>
              
              <button
                onClick={() => setActiveTab('quests')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'quests'
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Quests
              </button>
              
              <button
                onClick={() => setActiveTab('rules')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'rules'
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Teammate Rules
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings/Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
