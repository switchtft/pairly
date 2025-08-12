// src/app/profile/teammate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Trophy, 
  Users, 
  Edit3, 
  Save,
  X,
  MessageCircle,
  Crown,
  Shield,
  Clock,
  Heart,
  Ban,
  DollarSign,
  Gamepad2,
  ArrowRight,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { TeammateProfile } from '@/lib/types';

export default function TeammateProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teammateProfile, setTeammateProfile] = useState<TeammateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    discord: '',
    steam: '',
    twitter: '',
  });

  // Fetch teammate profile data
  const fetchTeammateProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      const userData = data.user;
      
      // Transform user data to TeammateProfile format
      const teammateData: TeammateProfile = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        bio: userData.bio,
        rating: userData.stats?.averageRating || 0,
        totalSessions: userData.stats?.totalSessions || 0,
        totalReviews: userData.stats?.totalReviews || 0,
        winRate: 0.78, // This would come from a separate API in a real implementation
        weeklyStats: {
          totalPayment: 450.25, // This would come from a separate API
          orders: 12,
          winRate: 0.83,
          leaderboardPosition: 5
        },
        socials: {
          discord: userData.discord || '',
          steam: userData.steam || '',
          twitter: '', // Not in current schema, would need to be added
        },
        favouriteCustomers: [], // This would come from a separate API
        blockedCustomers: [], // This would come from a separate API
        isOnline: userData.isOnline || false,
        createdAt: userData.createdAt,
        lastSeen: userData.lastSeen
      };
      
      setTeammateProfile(teammateData);
      setFormData({
        firstName: teammateData.firstName || '',
        lastName: teammateData.lastName || '',
        username: teammateData.username || '',
        bio: teammateData.bio || '',
        discord: teammateData.socials.discord || '',
        steam: teammateData.socials.steam || '',
        twitter: teammateData.socials.twitter || '',
      });
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only customers are restricted from accessing the teammate profile
    if (user && user.role === 'customer') {
      router.push('/profile');
      return;
    }

    // Administrators and teammates can access the teammate profile
    if (user && (user.role === 'teammate' || user.role === 'administrator')) {
      fetchTeammateProfile();
    }
  }, [user, isLoading, isAuthenticated, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          discord: formData.discord,
          steam: formData.steam,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update local state with the response data
      if (teammateProfile) {
        setTeammateProfile(prev => prev ? {
          ...prev,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          username: data.user.username,
          bio: data.user.bio,
          socials: {
            ...prev.socials,
            discord: data.user.discord || '',
            steam: data.user.steam || '',
          }
        } : null);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        // Update profile with the base64 avatar
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar: base64String,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update avatar');
        }

        const data = await response.json();
        
        // Update local state with the new avatar
        if (teammateProfile) {
          setTeammateProfile(prev => prev ? {
            ...prev,
            avatar: data.user.avatar,
          } : null);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Avatar upload failed. Please try again.');
    }
  };

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  if (!teammateProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-white">Failed to load mentor profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <ProfileHeader
          user={teammateProfile}
          stats={{
            rating: teammateProfile.rating,
            sessions: teammateProfile.totalSessions,
            reviews: teammateProfile.totalReviews,
          }}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Dashboard Redirect Button */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Settings className="text-[#e6915b]" size={20} />
                Mentor Dashboard
              </h2>
                              <p className="text-gray-400">Access your mentor dashboard to manage orders, view stats, and more.</p>
            </div>
            <Button 
              onClick={handleDashboardRedirect}
              className="bg-[#e6915b] hover:bg-[#d18251] flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Personal Information */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="text-[#e6915b]" size={20} />
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Email</label>
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                  <Mail className="text-[#e6915b]" size={16} />
                  <span className="text-[#e6915b]/80">{teammateProfile.email}</span>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">
                    {teammateProfile.firstName || 'Not set'}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">
                    {teammateProfile.lastName || 'Not set'}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">@{teammateProfile.username}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all resize-none text-white"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg min-h-[80px]">
                    {teammateProfile.bio || 'No bio set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gaming Information */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Gamepad2 className="text-[#e6915b]" size={20} />
              Gaming Profile
            </h2>

            <div className="space-y-4">
              {/* Win Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Win Rate</label>
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                  <Trophy className="text-yellow-400" size={16} />
                  <span className="text-white font-semibold">{(teammateProfile.winRate * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Weekly Stats */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Weekly Stats</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Payment</div>
                    <div className="text-white font-semibold">${teammateProfile.weeklyStats.totalPayment.toFixed(2)}</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Orders</div>
                    <div className="text-white font-semibold">{teammateProfile.weeklyStats.orders}</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-white font-semibold">{(teammateProfile.weeklyStats.winRate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-sm text-gray-400">Rank</div>
                    <div className="text-white font-semibold">#{teammateProfile.weeklyStats.leaderboardPosition}</div>
                  </div>
                </div>
              </div>

              {/* Discord */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Discord</label>
                {isEditing ? (
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={formData.discord}
                      onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                      placeholder="username#1234"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{teammateProfile.socials.discord || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Steam */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Steam</label>
                {isEditing ? (
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={formData.steam}
                      onChange={(e) => setFormData(prev => ({ ...prev, steam: e.target.value }))}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                      placeholder="Steam profile URL"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{teammateProfile.socials.steam || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Twitter</label>
                {isEditing ? (
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                      placeholder="@username"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{teammateProfile.socials.twitter || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favourite Customers */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Heart className="text-red-400" size={20} />
              Favourite Customers
            </h2>

            <div className="space-y-3">
              {teammateProfile.favouriteCustomers.length > 0 ? (
                teammateProfile.favouriteCustomers.map((customerId) => (
                  <div key={customerId} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6b8ab0] flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <div>
                        <div className="font-semibold text-white">Customer #{customerId}</div>
                        <div className="text-sm text-gray-400">Regular client</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>5 orders</div>
                      <div>⭐ 4.9</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Heart className="mx-auto mb-4" size={48} />
                  <p>No favourite customers yet</p>
                  <p className="text-sm">Add customers to your favourites for quick access!</p>
                </div>
              )}
            </div>
          </div>

          {/* Blocked Customers */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Ban className="text-red-500" size={20} />
              Blocked Customers
            </h2>

            <div className="space-y-3">
              {teammateProfile.blockedCustomers.length > 0 ? (
                teammateProfile.blockedCustomers.map((customerId) => (
                  <div key={customerId} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <div>
                        <div className="font-semibold text-gray-400">Customer #{customerId}</div>
                        <div className="text-sm text-gray-500">Blocked</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      Unblock
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Ban className="mx-auto mb-4" size={48} />
                  <p>No blocked customers</p>
                  <p className="text-sm">Blocked customers won&apos;t be able to order from you</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
