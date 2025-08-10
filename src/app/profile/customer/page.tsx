// src/app/profile/customer/page.tsx
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
  Plus,
  Minus
} from 'lucide-react';
import { CustomerProfile, MatchHistoryItem } from '@/lib/types';

const GAMES = [
  { id: 'valorant', name: 'Valorant' },
  { id: 'league', name: 'League of Legends' },
  { id: 'csgo', name: 'CS:GO 2' },
];

interface TeammateData {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rank?: string;
  role?: string;
  game?: string;
  isPro: boolean;
  verified: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export default function CustomerProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [favouriteTeammates, setFavouriteTeammates] = useState<TeammateData[]>([]);
  const [blockedTeammates, setBlockedTeammates] = useState<TeammateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    discord: '',
    steam: '',
    twitter: '',
    valorantNickname: '',
    leagueNickname: '',
    csgoNickname: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchProfileData();
    }
  }, [user, isLoading, isAuthenticated, router]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userProfile = profileData.user;
        
        setCustomerProfile({
          id: userProfile.id,
          email: userProfile.email,
          username: userProfile.username,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          avatar: userProfile.avatar,
          bio: userProfile.bio,
          balance: 150.75, // Placeholder - would come from payment system
          loyaltyLevel: 'Gold',
          loyaltyPoints: 1250,
          gameNicknames: {
            valorant: userProfile.gameNicknames?.valorant || '',
            league: userProfile.gameNicknames?.league || '',
            csgo: userProfile.gameNicknames?.csgo || ''
          },
          socials: {
            discord: userProfile.discord || '',
            steam: userProfile.steam || '',
            twitter: userProfile.twitter || ''
          },
          matchHistory: [],
          favouriteTeammates: [],
          blockedTeammates: [],
          createdAt: userProfile.createdAt,
          lastSeen: userProfile.lastSeen
        });

        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          username: userProfile.username || '',
          bio: userProfile.bio || '',
          discord: userProfile.discord || '',
          steam: userProfile.steam || '',
          twitter: userProfile.twitter || '',
          valorantNickname: userProfile.gameNicknames?.valorant || '',
          leagueNickname: userProfile.gameNicknames?.league || '',
          csgoNickname: userProfile.gameNicknames?.csgo || '',
        });
      }

      // Fetch match history
      const historyResponse = await fetch('/api/users/match-history', {
        credentials: 'include'
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setMatchHistory(historyData.matchHistory);
      }

      // Fetch favourite teammates
      const favouritesResponse = await fetch('/api/users/favourites', {
        credentials: 'include'
      });
      
      if (favouritesResponse.ok) {
        const favouritesData = await favouritesResponse.json();
        setFavouriteTeammates(favouritesData.favourites.map((f: { favourite: TeammateData }) => f.favourite));
      }

      // Fetch blocked teammates
      const blocksResponse = await fetch('/api/users/blocks', {
        credentials: 'include'
      });
      
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        setBlockedTeammates(blocksData.blocks.map((b: { blocked: TeammateData }) => b.blocked));
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          discord: formData.discord,
          steam: formData.steam,
          // Note: gameNicknames would need a separate endpoint or schema update
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerProfile(prev => prev ? {
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          socials: {
            discord: formData.discord,
            steam: formData.steam,
            twitter: formData.twitter,
          }
        } : null);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToFavourites = async (teammateId: number) => {
    try {
      const response = await fetch('/api/users/favourites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teammateId })
      });

      if (response.ok) {
        const data = await response.json();
        setFavouriteTeammates(prev => [...prev, data.favourite.favourite]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add to favourites');
      }
    } catch (error) {
      console.error('Failed to add to favourites:', error);
      setError('Failed to add to favourites');
    }
  };

  const handleRemoveFromFavourites = async (teammateId: number) => {
    try {
      const response = await fetch(`/api/users/favourites?teammateId=${teammateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setFavouriteTeammates(prev => prev.filter(t => t.id !== teammateId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove from favourites');
      }
    } catch (error) {
      console.error('Failed to remove from favourites:', error);
      setError('Failed to remove from favourites');
    }
  };

  const handleBlockTeammate = async (teammateId: number) => {
    try {
      const response = await fetch('/api/users/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teammateId })
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedTeammates(prev => [...prev, data.block.blocked]);
        // Remove from favourites if they were favourited
        setFavouriteTeammates(prev => prev.filter(t => t.id !== teammateId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to block teammate');
      }
    } catch (error) {
      console.error('Failed to block teammate:', error);
      setError('Failed to block teammate');
    }
  };

  const handleUnblockTeammate = async (teammateId: number) => {
    try {
      const response = await fetch(`/api/users/blocks?teammateId=${teammateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setBlockedTeammates(prev => prev.filter(t => t.id !== teammateId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unblock teammate');
      }
    } catch (error) {
      console.error('Failed to unblock teammate:', error);
      setError('Failed to unblock teammate');
    }
  };

  const handleDirectOrder = async (teammateId: number) => {
    try {
      const response = await fetch('/api/orders/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          teammateId,
          game: 'valorant', // Default game - could be made configurable
          mode: 'duo',
          duration: 60,
          price: 15.00
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Direct order created successfully!');
        // Could redirect to session page or show success message
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create direct order');
      }
    } catch (error) {
      console.error('Failed to create direct order:', error);
      setError('Failed to create direct order');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    // In Phase 3, this would upload to a file service
    console.log('Avatar upload:', file.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆';
      case 'loss': return '❌';
      case 'draw': return '🤝';
      default: return '❓';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Failed to load profile</p>
          {error && <p className="text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <ProfileHeader
          user={customerProfile}
          stats={{
            balance: customerProfile.balance,
            loyaltyLevel: customerProfile.loyaltyLevel,
          }}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          onAvatarUpload={handleAvatarUpload}
        />

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
                  <span className="text-[#e6915b]/80">{customerProfile.email}</span>
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
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">
                    {customerProfile.firstName || 'Not set'}
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
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">
                    {customerProfile.lastName || 'Not set'}
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
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">@{customerProfile.username}</p>
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
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg min-h-[80px]">
                    {customerProfile.bio || 'No bio set'}
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
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder="username#1234"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{customerProfile.socials.discord || 'Not set'}</span>
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
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder="Steam profile URL"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{customerProfile.socials.steam || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Game Nicknames */}
              {GAMES.map(game => (
                <div key={game.id}>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{game.name} Nickname</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData[`${game.id}Nickname` as keyof typeof formData] as string}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`${game.id}Nickname`]: e.target.value }))}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder={`Enter ${game.name} nickname`}
                    />
                  ) : (
                    <p className="text-gray-300 p-3 bg-[#2a2a2a] rounded-lg">
                      {customerProfile.gameNicknames[game.id] || 'Not set'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Trophy className="text-[#e6915b]" size={20} />
            Match History
          </h2>

          <div className="space-y-4">
            {matchHistory.length > 0 ? (
              matchHistory.map((match) => (
                <div key={match.id} className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getResultIcon(match.result)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{match.teammateName}</span>
                        <span className={`text-sm ${getResultColor(match.result)}`}>
                          {match.result.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDate(match.date)} • {match.game} • {match.duration}min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">${match.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">Order #{match.id}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="mx-auto mb-4" size={48} />
                <p>No match history yet</p>
                <p className="text-sm">Start playing with teammates to see your history here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Teammate Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favourite Teammates */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Heart className="text-red-400" size={20} />
              Favourite Teammates
            </h2>

            <div className="space-y-3">
              {favouriteTeammates.length > 0 ? (
                favouriteTeammates.map((teammate) => (
                  <div key={teammate.id} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e6915b] flex items-center justify-center text-white font-bold">
                        {teammate.avatar ? (
                          <img 
                            src={teammate.avatar} 
                            alt={teammate.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          teammate.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{teammate.username}</div>
                        <div className="text-sm text-gray-400">
                          ⭐ {teammate.averageRating?.toFixed(1) || '0.0'} ({teammate.totalReviews || 0} reviews)
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-[#e6915b] hover:bg-[#d18251]"
                        onClick={() => handleDirectOrder(teammate.id)}
                      >
                        Order Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleRemoveFromFavourites(teammate.id)}
                      >
                        <Minus size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Heart className="mx-auto mb-4" size={48} />
                  <p>No favourite teammates yet</p>
                  <p className="text-sm">Add teammates to your favourites for quick access!</p>
                </div>
              )}
            </div>
          </div>

          {/* Blocked Teammates */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Ban className="text-red-500" size={20} />
              Blocked Teammates
            </h2>

            <div className="space-y-3">
              {blockedTeammates.length > 0 ? (
                blockedTeammates.map((teammate) => (
                  <div key={teammate.id} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                        {teammate.avatar ? (
                          <img 
                            src={teammate.avatar} 
                            alt={teammate.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          teammate.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-400">{teammate.username}</div>
                        <div className="text-sm text-gray-500">Blocked</div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => handleUnblockTeammate(teammate.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Ban className="mx-auto mb-4" size={48} />
                  <p>No blocked teammates</p>
                  <p className="text-sm">Blocked teammates won&apos;t be able to accept your orders</p>
                </div>
              )}
            </div>
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
              <X size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
