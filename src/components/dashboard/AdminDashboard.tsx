'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminDashboardProps {
  user: { id: number; username: string; email: string; userType: string }; // Will be properly typed later
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    onlineTeammates: 0,
    totalRevenue: 0,
    activeSessions: 0,
    pendingOrders: 0
  });
  const [liveOrders, setLiveOrders] = useState([]);
  const [onlineTeammates, setOnlineTeammates] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    fetchAdminData();
    // Set up real-time updates
    const interval = setInterval(fetchAdminData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch platform statistics
      const statsResponse = await fetch('/api/admin/dashboard');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPlatformStats({
          totalUsers: statsData.totalUsers,
          totalOrders: statsData.totalOrders,
          onlineTeammates: statsData.onlineTeammates,
          totalRevenue: statsData.totalRevenue,
          activeSessions: statsData.activeSessions,
          pendingOrders: statsData.pendingOrders
        });
        
        setLiveOrders(statsData.recentOrders);
        setOnlineTeammates(statsData.onlineTeammates);
        setRecentUsers(statsData.recentUsers);
      }
      
      // Fetch system alerts (placeholder for now)
      setSystemAlerts([
        {
          id: 1,
          type: 'info',
          message: 'System running normally',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  const createUser = async (userData: { username: string; email: string; password: string; userType: string; game?: string }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        alert('User created successfully!');
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const updateUser = async (userId: string, userData: { username?: string; email?: string; userType?: string; game?: string; isOnline?: boolean; isPro?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, ...userData }),
      });
      
      if (response.ok) {
        alert('User updated successfully!');
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });
      
      if (response.ok) {
        alert('User deleted successfully!');
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Teammates</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.onlineTeammates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${platformStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
        {systemAlerts.length > 0 ? (
          <div className="space-y-3">
            {systemAlerts.map((alert: { id: number; type: string; message: string; timestamp: string }) => (
              <div key={alert.id} className={`p-3 rounded-lg ${
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.type === 'warning' ? 'bg-yellow-400' :
                      alert.type === 'error' ? 'bg-red-400' :
                      'bg-blue-400'
                    }`}></span>
                    <span className="text-sm text-gray-900">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No system alerts at the moment.</p>
        )}
      </div>
    </div>
  );

  const renderLiveOrdersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Orders</h3>
        {liveOrders.length > 0 ? (
          <div className="space-y-4">
            {liveOrders.map((order: { id: number; customerName: string; teammateName: string; gameType: string; startTime: string; price: number; status: string }) => (
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
                      <p className="text-sm text-gray-600">
                        Teammate: {order.teammateName} • {order.gameType}
                      </p>
                      <p className="text-sm text-gray-600">Started: {order.startTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${order.price}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'Active' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No live orders at the moment.</p>
        )}
      </div>
    </div>
  );

  const renderOnlineTeammatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Teammates</h3>
        {onlineTeammates.length > 0 ? (
          <div className="space-y-4">
            {onlineTeammates.map((teammate: { id: number; username: string; game: string; lastSeen: string; rating: number; isOnline: boolean }) => (
              <div key={teammate.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {teammate.username[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{teammate.username}</h4>
                      <p className="text-sm text-gray-600">{teammate.game}</p>
                      <p className="text-sm text-gray-600">Last seen: {teammate.lastSeen}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{teammate.rating}</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">${teammate.hourlyRate}/hr</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No teammates online at the moment.</p>
        )}
      </div>
    </div>
  );

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage All Users
          </button>
        </div>
        
        {recentUsers.length > 0 ? (
          <div className="space-y-4">
            {recentUsers.map((user: { id: number; username: string; email: string; userType: string; createdAt: string }) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.username}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">Type: {user.userType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{user.createdAt}</p>
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent users to display.</p>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'liveOrders':
        return renderLiveOrdersTab();
      case 'onlineTeammates':
        return renderOnlineTeammatesTab();
      case 'userManagement':
        return renderUserManagementTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            {/* Admin Info */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                  <p className="text-sm text-gray-600">Full Platform Control</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('liveOrders')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'liveOrders'
                    ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Live Orders
              </button>
              
              <button
                onClick={() => setActiveTab('onlineTeammates')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'onlineTeammates'
                    ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Online Teammates
              </button>
              
              <button
                onClick={() => setActiveTab('userManagement')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'userManagement'
                    ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                User Management
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
