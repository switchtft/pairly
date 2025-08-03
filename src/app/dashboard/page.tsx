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
  Shield
} from 'lucide-react';

interface DashboardStats {
  upcomingSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
  winRate: number;
  activeTournaments: number;
}

interface RecentActivity {
  id: string;
  type: 'session' | 'tournament' | 'review';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'upcoming' | 'in-progress';
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 3,
    completedSessions: 47,
    averageRating: 4.8,
    totalEarnings: 1420,
    winRate: 73,
    activeTournaments: 2,
  });
  
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'session',
      title: 'Duo Session with MasterYi',
      description: 'Ranked Valorant coaching session',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'upcoming'
    },
    {
      id: '2',
      type: 'tournament',
      title: 'Winter Championship',
      description: 'Qualified for semifinals',
      timestamp: '2024-01-14T20:00:00Z',
      status: 'in-progress'
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review Received',
      description: '5-star review from coaching session',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'completed'
    },
    {
      id: '4',
      type: 'session',
      title: 'CS:GO Strategy Session',
      description: 'Team tactics and map control',
      timestamp: '2024-01-13T19:00:00Z',
      status: 'completed'
    },
  ]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Users className="text-[#e6915b]" size={20} />;
      case 'tournament':
        return <Trophy className="text-yellow-400" size={20} />;
      case 'review':
        return <Star className="text-blue-400" size={20} />;
      default:
        return <Calendar className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400';
      case 'in-progress':
        return 'text-green-400';
      case 'completed':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {getDisplayName()}! 
                {user.verified && <Shield className="inline ml-2 text-blue-400" size={24} />}
                {user.isPro && <Crown className="inline ml-2 text-yellow-400" size={24} />}
              </h1>
              <p className="text-gray-400">Here's what's happening with your gaming profile</p>
            </div>
            <div className="flex gap-3">
              <Button 
                asChild
                className="bg-[#e6915b] hover:bg-[#d18251]"
              >
                <Link href="/profile">View Profile</Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10"
              >
                <Link href="/duo">Find Duo</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#e6915b]/20 p-3 rounded-lg">
                <Calendar className="text-[#e6915b]" size={24} />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.upcomingSessions}</h3>
            <p className="text-gray-400">Upcoming Sessions</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#6b8ab0]/20 p-3 rounded-lg">
                <Users className="text-[#6b8ab0]" size={24} />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.completedSessions}</h3>
            <p className="text-gray-400">Completed Sessions</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Star className="text-yellow-400" size={24} />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +0.2
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.averageRating}</h3>
            <p className="text-gray-400">Average Rating</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Target className="text-green-400" size={24} />
              </div>
              <span className="text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.winRate}%</h3>
            <p className="text-gray-400">Win Rate</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-[#e6915b]" size={20} />
                Recent Activity
              </h2>
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-400"
              >
                <Link href="/activity">View All</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{activity.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </p>
                    <p className="text-gray-500 text-xs">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="text-[#e6915b]" size={20} />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251] justify-start"
                >
                  <Link href="/duo">
                    <Users size={16} className="mr-2" />
                    Find Duo Partner
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-[#6b8ab0] to-[#6b8ab0] hover:from-[#5a79a0] hover:to-[#5a79a0] justify-start"
                >
                  <Link href="/coaching">
                    <User size={16} className="mr-2" />
                    Book Coaching
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700 justify-start"
                >
                  <Link href="/tournaments">
                    <Trophy size={16} className="mr-2" />
                    Join Tournament
                  </Link>
                </Button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="text-[#e6915b]" size={20} />
                Performance
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Earnings</span>
                  <span className="text-green-400 font-bold">${stats.totalEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Tournaments</span>
                  <span className="text-white font-bold">{stats.activeTournaments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-blue-400 font-bold">{stats.winRate}%</span>
                </div>
                <div className="pt-2 border-t border-[#2a2a2a]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Monthly Goal</span>
                    <span className="text-gray-400">75%</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Profile Summary */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Gaming Profile</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-[#e6915b] font-bold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">@{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.game || 'No game set'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-white">{user.rank || 'Unranked'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role</span>
                    <span className="text-white">{user.role || 'Flex'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400">Online</span>
                  </div>
                </div>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-[#6b8ab0] text-[#6b8ab0] hover:bg-[#6b8ab0]/10"
                >
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}