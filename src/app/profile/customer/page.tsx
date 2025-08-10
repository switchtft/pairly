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
  Gamepad2
} from 'lucide-react';
import { CustomerProfile, MatchHistoryItem } from '@/lib/types';

const GAMES = [
  { id: 'valorant', name: 'Valorant' },
  { id: 'league', name: 'League of Legends' },
  { id: 'csgo', name: 'CS:GO 2' },
];

// Placeholder data for Phase 1
const placeholderCustomerProfile: CustomerProfile = {
  id: 1,
  email: 'customer@example.com',
  username: 'customer123',
  firstName: 'John',
  lastName: 'Doe',
  avatar: '',
  bio: 'Passionate gamer looking for great teammates!',
  balance: 150.75,
  loyaltyLevel: 'Gold',
  loyaltyPoints: 1250,
  gameNicknames: {
    valorant: 'ValorantPlayer#123',
    league: 'LeagueGamer',
    csgo: 'CSGOPlayer'
  },
  socials: {
    discord: 'customer#1234',
    steam: 'https://steamcommunity.com/id/customer',
    twitter: '@customer123'
  },
  matchHistory: [
    {
      id: 1,
      date: '2025-01-15T10:30:00Z',
      game: 'Valorant',
      result: 'win',
      teammateId: 2,
      teammateName: 'ProTeammate',
      teammateAvatar: '',
      price: 25.00,
      duration: 60
    },
    {
      id: 2,
      date: '2025-01-14T15:45:00Z',
      game: 'League of Legends',
      result: 'loss',
      teammateId: 3,
      teammateName: 'ElitePlayer',
      teammateAvatar: '',
      price: 30.00,
      duration: 45
    }
  ],
  favouriteTeammates: [2, 4, 6],
  blockedTeammates: [5],
  createdAt: '2024-01-01T00:00:00Z',
  lastSeen: new Date().toISOString()
};

export default function CustomerProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(placeholderCustomerProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  
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

    // In Phase 1, we use placeholder data
    setFormData({
      firstName: customerProfile.firstName || '',
      lastName: customerProfile.lastName || '',
      username: customerProfile.username || '',
      bio: customerProfile.bio || '',
      discord: customerProfile.socials.discord || '',
      steam: customerProfile.socials.steam || '',
      twitter: customerProfile.socials.twitter || '',
      valorantNickname: customerProfile.gameNicknames.valorant || '',
      leagueNickname: customerProfile.gameNicknames.league || '',
      csgoNickname: customerProfile.gameNicknames.csgo || '',
    });
  }, [user, isLoading, isAuthenticated, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In Phase 1, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCustomerProfile(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        bio: formData.bio,
        socials: {
          discord: formData.discord,
          steam: formData.steam,
          twitter: formData.twitter,
        },
        gameNicknames: {
          valorant: formData.valorantNickname,
          league: formData.leagueNickname,
          csgo: formData.csgoNickname,
        }
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    // In Phase 1, just simulate upload
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
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
            {customerProfile.matchHistory.length > 0 ? (
              customerProfile.matchHistory.map((match) => (
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
              {customerProfile.favouriteTeammates.length > 0 ? (
                customerProfile.favouriteTeammates.map((teammateId) => (
                  <div key={teammateId} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e6915b] flex items-center justify-center text-white font-bold">
                        T
                      </div>
                      <div>
                        <div className="font-semibold text-white">Teammate #{teammateId}</div>
                        <div className="text-sm text-gray-400">⭐ 4.8 (15 reviews)</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-[#e6915b] hover:bg-[#d18251]">
                      Order Now
                    </Button>
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
              {customerProfile.blockedTeammates.length > 0 ? (
                customerProfile.blockedTeammates.map((teammateId) => (
                  <div key={teammateId} className="bg-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                        T
                      </div>
                      <div>
                        <div className="font-semibold text-gray-400">Teammate #{teammateId}</div>
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
                  <p>No blocked teammates</p>
                  <p className="text-sm">Blocked teammates won&apos;t be able to accept your orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
