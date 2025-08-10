'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  User, 
  Star, 
  Gamepad2, 
  Clock, 
  RefreshCw,
  Filter,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Teammate {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  game: string | null;
  rank: string | null;
  isOnline: boolean;
  lastSeen: string;
  totalSessions: number;
  averageRating: number;
}

interface TeammatesResponse {
  teammates: Teammate[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function AdminTeammatesView() {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    online: false,
    game: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchTeammates = async (refresh = false) => {
    try {
      const params = new URLSearchParams();
      if (filters.online) params.append('online', 'true');
      if (filters.game) params.append('game', filters.game);
      params.append('limit', pagination.limit.toString());
      params.append('offset', refresh ? '0' : pagination.offset.toString());

      const response = await fetch(`/api/admin/teammates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch teammates');

      const data: TeammatesResponse = await response.json();
      
      if (refresh) {
        setTeammates(data.teammates);
        setPagination(data.pagination);
      } else {
        setTeammates(prev => [...prev, ...data.teammates]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching teammates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeammates(true);
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeammates(true);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchTeammates();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 4.0) return 'text-yellow-400';
    if (rating >= 3.0) return 'text-orange-400';
    return 'text-red-400';
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

  const onlineTeammates = teammates.filter(t => t.isOnline);
  const offlineTeammates = teammates.filter(t => !t.isOnline);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#e6915b]" size={20} />
            Teammates Overview
          </h2>
          <p className="text-gray-400 text-sm">
            {pagination.total} total teammates • {onlineTeammates.length} online
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.online}
              onChange={(e) => setFilters(prev => ({ ...prev, online: e.target.checked }))}
              className="w-4 h-4 text-[#e6915b] bg-[#2a2a2a] border-[#333] rounded focus:ring-[#e6915b] focus:ring-2"
            />
            <span className="text-white text-sm">Online only</span>
          </label>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 rounded-lg p-2">
              <Wifi className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-white font-semibold">{onlineTeammates.length}</p>
              <p className="text-gray-400 text-sm">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="bg-gray-500/10 rounded-lg p-2">
              <WifiOff className="text-gray-400" size={20} />
            </div>
            <div>
              <p className="text-white font-semibold">{offlineTeammates.length}</p>
              <p className="text-gray-400 text-sm">Offline</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="bg-[#e6915b]/10 rounded-lg p-2">
              <Star className="text-[#e6915b]" size={20} />
            </div>
            <div>
              <p className="text-white font-semibold">
                {teammates.length > 0 
                  ? (teammates.reduce((sum, t) => sum + t.averageRating, 0) / teammates.length).toFixed(1)
                  : '0.0'
                }
              </p>
              <p className="text-gray-400 text-sm">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teammates List */}
      <div className="space-y-4">
        {teammates.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400">No teammates found</p>
          </div>
        ) : (
          teammates.map((teammate) => (
            <div
              key={teammate.id}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333] hover:border-[#444] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#e6915b]/10 rounded-lg flex items-center justify-center">
                      <User className="text-[#e6915b]" size={24} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1a1a] ${
                      teammate.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {teammate.firstName && teammate.lastName 
                        ? `${teammate.firstName} ${teammate.lastName}`
                        : teammate.username
                      }
                    </h3>
                    <p className="text-gray-400 text-sm">@{teammate.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className={`${getRatingColor(teammate.averageRating)}`} size={16} />
                    <span className={`text-sm font-medium ${getRatingColor(teammate.averageRating)}`}>
                      {teammate.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{teammate.totalSessions} sessions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {teammate.game || 'No game'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {teammate.rank || 'No rank'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {teammate.isOnline ? 'Online' : 'Offline'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatDate(teammate.lastSeen)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">{teammate.email}</p>
                    <p className="text-gray-400 text-xs">Contact</p>
                  </div>
                </div>
              </div>
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
            Load More Teammates
          </Button>
        </div>
      )}
    </div>
  );
}
