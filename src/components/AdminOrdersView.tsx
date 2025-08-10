'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  Users, 
  DollarSign, 
  Gamepad2, 
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface Order {
  id: number;
  game: string;
  mode: string;
  status: string;
  price: number;
  duration: number;
  createdAt: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  teammate?: {
    id: number;
    username: string;
    email: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function AdminOrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    game: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchOrders = async (refresh = false) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.game) params.append('game', filters.game);
      params.append('limit', pagination.limit.toString());
      params.append('offset', refresh ? '0' : pagination.offset.toString());

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) throw new Error('Failed to fetch orders');

      const data: OrdersResponse = await response.json();
      
      if (refresh) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        setOrders(prev => [...prev, ...data.orders]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-[#e6915b]" size={20} />
            Real-time Orders
          </h2>
          <p className="text-gray-400 text-sm">
            {pagination.total} total orders • {orders.filter(o => o.status === 'active').length} active
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
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full bg-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-[#333] hover:border-[#444] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-[#e6915b]/10 rounded-lg p-2">
                    <Gamepad2 className="text-[#e6915b]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      Order #{order.id} • {order.game.toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-sm">{order.mode} mode</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">{order.client.username}</p>
                    <p className="text-gray-400 text-xs">{order.client.email}</p>
                  </div>
                </div>

                {order.teammate && (
                  <div className="flex items-center gap-2">
                    <Users className="text-gray-400" size={16} />
                    <div>
                      <p className="text-white text-sm font-medium">{order.teammate.username}</p>
                      <p className="text-gray-400 text-xs">{order.teammate.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <DollarSign className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">{formatPrice(order.price)}</p>
                    <p className="text-gray-400 text-xs">{formatDuration(order.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={16} />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {formatDate(order.createdAt)}
                    </p>
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
            Load More Orders
          </Button>
        </div>
      )}
    </div>
  );
}
