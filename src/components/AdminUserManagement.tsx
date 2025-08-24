'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Crown,
  Gamepad2,
  Clock,
  RefreshCw,
  Filter,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: string | null;
  game: string | null;
  rank: string | null;
  isPro: boolean;
  isOnline: boolean;
  verified: boolean;
  createdAt: string;
  lastSeen: string;
  totalSessions: number;
  totalReviews: number;
}

interface UsersResponse {
  users: UserData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    role: '',
    game: '',
    verified: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchUsers = async (refresh = false) => {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.game) params.append('game', filters.game);
      if (filters.verified !== '') params.append('verified', filters.verified);
      params.append('limit', pagination.limit.toString());
      params.append('offset', refresh ? '0' : pagination.offset.toString());

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data: UsersResponse = await response.json();
      
      if (refresh) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setUsers(prev => [...prev, ...data.users]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(true);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchUsers();
    }
  };

  const handleUpdateUser = async (userId: number, updates: {
    role?: string;
    verified?: boolean;
    isPro?: boolean;
  }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, ...updates }
          : user
      ));

      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'administrator':
        return <Crown className="text-red-400" size={16} />;
      case 'teammate':
        return <Shield className="text-[#e6915b]" size={16} />;
      default:
        return <User className="text-gray-400" size={16} />;
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'administrator':
        return 'text-red-400 bg-red-400/10';
      case 'teammate':
        return 'text-[#e6915b] bg-[#e6915b]/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#e6915b]"></div>
        </div>
      </div>
    );
  }

  const customers = users.filter(u => u.role === 'customer');
  const mentors = users.filter(u => u.role === 'teammate');
  const admins = users.filter(u => u.role === 'administrator');

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#e6915b]" size={20} />
            User Management
          </h2>
          <p className="text-gray-400 text-sm">
            {pagination.total} total users • {customers.length} customers • {mentors.length} mentors • {admins.length} admins
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-white"
        >
          <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            className="w-full bg-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] text-white"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="teammate">Mentor</option>
            <option value="administrator">Administrator</option>
          </select>
        </div>
        
        <div className="relative">
          <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={filters.game}
            onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
            className="w-full bg-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] text-white"
          >
            <option value="">All Games</option>
            <option value="valorant">Valorant</option>
            <option value="league">League of Legends</option>
            <option value="csgo">CS:GO</option>
          </select>
        </div>

        <div className="relative">
          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={filters.verified}
            onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
            className="w-full bg-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] text-white"
          >
            <option value="">All Users</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333] hover:border-[#444] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#e6915b]/10 rounded-lg flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1a1a] ${
                      user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </h3>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role === 'teammate' ? 'mentor' : (user.role || 'customer')}
                  </span>
                  {editingUser === user.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setEditingUser(user.id)}
                      className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-white"
                    >
                      <Edit size={14} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">{user.email}</p>
                    <p className="text-gray-400 text-xs">Email</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gamepad2 className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user.game || 'No game'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user.rank || 'No rank'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user.totalSessions} sessions
                    </p>
                    <p className="text-gray-400 text-xs">
                      {user.totalReviews} reviews
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                    <p className="text-gray-400 text-xs">Joined</p>
                  </div>
                </div>
              </div>

              {/* Edit Mode */}
              {editingUser === user.id && (
                <div className="bg-[#333] rounded-lg p-4 mt-3">
                  <h4 className="text-white font-semibold mb-3">Edit User</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                      <select
                        defaultValue={user.role || 'customer'}
                        className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 border border-[#444] text-white"
                        onChange={(e) => {
                          const newRole = e.target.value;
                          handleUpdateUser(user.id, { role: newRole });
                        }}
                      >
                        <option value="customer">Customer</option>
                        <option value="teammate">Mentor</option>
                        <option value="administrator">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Verified</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { verified: true })}
                          className={`${user.verified ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700 text-white`}
                        >
                          <CheckCircle size={14} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { verified: false })}
                          className={`${!user.verified ? 'bg-red-600' : 'bg-gray-600'} hover:bg-red-700 text-white`}
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Pro Status</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { isPro: true })}
                          className={`${user.isPro ? 'bg-[#e6915b]' : 'bg-gray-600'} hover:bg-[#d18251] text-white`}
                        >
                          <Shield size={14} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { isPro: false })}
                          className={`${!user.isPro ? 'bg-gray-600' : 'bg-gray-600'} hover:bg-gray-700 text-white`}
                        >
                          <User size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center mt-6">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white"
          >
            Load More Users
          </Button>
        </div>
      )}
    </div>
  );
}
