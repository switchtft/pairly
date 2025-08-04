// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Trophy, 
  Users, 
  Camera, 
  Edit3, 
  Save,
  X,
  MapPin,
  MessageCircle,
  Crown,
  Shield,
  Clock
} from 'lucide-react';

const GAMES = [
  { id: 'valorant', name: 'Valorant' },
  { id: 'league', name: 'League of Legends' },
  { id: 'csgo', name: 'CS:GO 2' },
];

const ROLES = {
  valorant: ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
  league: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
  csgo: ['Entry Fragger', 'AWPer', 'Support', 'IGL', 'Lurker'],
};

const RANKS = {
  valorant: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
  league: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
  csgo: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite'],
};

interface UserStats {
  totalSessions: number;
  totalReviews: number;
  averageRating: number;
}

interface ExtendedUser {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  game?: string;
  role?: string;
  rank?: string;
  isPro: boolean;
  verified: boolean;
  discord?: string;
  steam?: string;
  timezone?: string;
  languages: string[];
  isOnline: boolean;
  createdAt: string;
  lastSeen: string;
  stats: UserStats;
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    game: '',
    role: '',
    rank: '',
    discord: '',
    steam: '',
    timezone: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchExtendedProfile();
    }
  }, [user, isLoading, isAuthenticated, router]);

  const fetchExtendedProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setExtendedUser(data.user);
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          username: data.user.username || '',
          bio: data.user.bio || '',
          game: data.user.game || '',
          role: data.user.role || '',
          rank: data.user.rank || '',
          discord: data.user.discord || '',
          steam: data.user.steam || '',
          timezone: data.user.timezone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser(formData);
      await fetchExtendedProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await fetchExtendedProfile();
      } else {
        console.error('Avatar upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getDisplayName = () => {
    if (!extendedUser) return '';
    if (extendedUser.firstName && extendedUser.lastName) {
      return `${extendedUser.firstName} ${extendedUser.lastName}`;
    }
    return extendedUser.username;
  };

  const selectedGameRoles = formData.game ? ROLES[formData.game as keyof typeof ROLES] || [] : [];
  const selectedGameRanks = formData.game ? RANKS[formData.game as keyof typeof RANKS] || [] : [];

  if (isLoading || !extendedUser) {
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
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden mb-8">
          {/* Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#1a1a1a] overflow-hidden bg-[#2a2a2a]">
                {extendedUser.avatar ? (
                  <img 
                    src={extendedUser.avatar} 
                    alt={getDisplayName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#e6915b]">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Avatar Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                  ) : (
                    <Camera className="text-white" size={24} />
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {/* Online Status */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#1a1a1a] ${
                extendedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>

            {/* Basic Info */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{getDisplayName()}</h1>
                  {extendedUser.verified && (
                    <Shield className="text-[#e6915b]" size={24} />
                  )}
                  {extendedUser.isPro && (
                    <Crown className="text-yellow-400" size={24} />
                  )}
                </div>
                <p className="text-[#e6915b] mb-2">@{extendedUser.username}</p>
                {extendedUser.bio && (
                  <p className="text-[#e6915b]/80 max-w-2xl">{extendedUser.bio}</p>
                )}
              </div>
              
              {/* Edit Button */}
              <Button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                className={`flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-[#e6915b] hover:bg-[#d18251]'
                }`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : isEditing ? (
                  <Save size={16} />
                ) : (
                  <Edit3 size={16} />
                )}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-[#e6915b] text-sm">Rating</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {extendedUser.stats.averageRating.toFixed(1)}
                </p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-[#e6915b]" size={20} />
                  <span className="text-[#e6915b] text-sm">Sessions</span>
                </div>
                <p className="text-2xl font-bold text-white">{extendedUser.stats.totalSessions}</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-[#6b8ab0]" size={20} />
                  <span className="text-[#e6915b] text-sm">Reviews</span>
                </div>
                <p className="text-2xl font-bold text-white">{extendedUser.stats.totalReviews}</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-green-400" size={20} />
                  <span className="text-[#e6915b] text-sm">Joined</span>
                </div>
                <p className="text-lg font-bold text-white">{formatJoinDate(extendedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="text-[#e6915b]" size={20} />
                Personal Information
              </h2>
              {isEditing && (
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                  className="border-[#e6915b]/30 text-[#e6915b]"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Email</label>
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                          <Mail className="text-[#e6915b]" size={16} />
        <span className="text-[#e6915b]/80">{extendedUser.email}</span>
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
                    {extendedUser.firstName || 'Not set'}
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
                    {extendedUser.lastName || 'Not set'}
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
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">@{extendedUser.username}</p>
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
                    {extendedUser.bio || 'No bio set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gaming Information */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Trophy className="text-[#e6915b]" size={20} />
              Gaming Profile
            </h2>

            <div className="space-y-4">
              {/* Primary Game */}
              <div>
                <label className="block text-sm font-medium text-[#e6915b] mb-2">Primary Game</label>
                {isEditing ? (
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value, role: '', rank: '' }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                  >
                    <option value="">Select a game</option>
                    {GAMES.map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">
                    {GAMES.find(g => g.id === extendedUser.game)?.name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Role</label>
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                    disabled={!formData.game}
                  >
                    <option value="">Select a role</option>
                    {selectedGameRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-300 p-3 bg-[#2a2a2a] rounded-lg">
                    {extendedUser.role || 'Not set'}
                  </p>
                )}
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Rank</label>
                {isEditing ? (
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}
                    className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                    disabled={!formData.game}
                  >
                    <option value="">Select a rank</option>
                    {selectedGameRanks.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-300 p-3 bg-[#2a2a2a] rounded-lg">
                    {extendedUser.rank || 'Not set'}
                  </p>
                )}
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
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-10 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder="username#1234"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                    <MessageCircle className="text-gray-400" size={16} />
                    <span className="text-gray-300">{extendedUser.discord || 'Not set'}</span>
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
                    <span className="text-gray-300">{extendedUser.steam || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Last Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Activity</label>
                <div className="flex items-center gap-2 p-3 bg-[#2a2a2a] rounded-lg">
                  <Clock className="text-gray-400" size={16} />
                  <span className="text-gray-300">
                    {new Date(extendedUser.lastSeen).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}