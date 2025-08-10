// src/components/ProfileHeader.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Crown,
  Star,
  Trophy,
  Users,
  Calendar,
  Mail
} from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    verified?: boolean;
    isPro?: boolean;
    createdAt: string;
    lastSeen?: string;
  };
  stats?: {
    rating?: number;
    sessions?: number;
    reviews?: number;
    balance?: number;
    loyaltyLevel?: string;
  };
  isEditing: boolean;
  isSaving: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarUpload: (file: File) => void;
  showEditButton?: boolean;
  showStats?: boolean;
}

export default function ProfileHeader({
  user,
  stats,
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
  onCancel,
  onAvatarUpload,
  showEditButton = true,
  showStats = true
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      await onAvatarUpload(file);
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
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  return (
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
            {user.avatar ? (
              <img 
                src={user.avatar} 
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
          {user.lastSeen && (
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-[#1a1a1a] ${
              new Date(user.lastSeen) > new Date(Date.now() - 5 * 60 * 1000) ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{getDisplayName()}</h1>
              {user.verified && (
                <Shield className="text-[#e6915b]" size={24} />
              )}
              {user.isPro && (
                <Crown className="text-yellow-400" size={24} />
              )}
            </div>
            <p className="text-[#e6915b] mb-2">@{user.username}</p>
            {user.bio && (
              <p className="text-[#e6915b]/80 max-w-2xl">{user.bio}</p>
            )}
          </div>
          
          {/* Edit Button */}
          {showEditButton && (
            <div className="flex gap-2">
              {isEditing && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="border-[#e6915b]/30 text-[#e6915b]"
                >
                  <X size={16} />
                </Button>
              )}
              <Button
                onClick={() => isEditing ? onSave() : onEditToggle()}
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
          )}
        </div>

        {/* Stats */}
        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.rating !== undefined && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-[#e6915b] text-sm">Rating</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats.rating.toFixed(1)}
                </p>
              </div>
            )}
            
            {stats.sessions !== undefined && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="text-[#e6915b]" size={20} />
                  <span className="text-[#e6915b] text-sm">Sessions</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.sessions}</p>
              </div>
            )}
            
            {stats.reviews !== undefined && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-[#6b8ab0]" size={20} />
                  <span className="text-[#e6915b] text-sm">Reviews</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.reviews}</p>
              </div>
            )}
            
            {stats.balance !== undefined && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="text-green-400" size={20} />
                  <span className="text-[#e6915b] text-sm">Balance</span>
                </div>
                <p className="text-2xl font-bold text-white">${stats.balance.toFixed(2)}</p>
              </div>
            )}
            
            {stats.loyaltyLevel && (
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="text-purple-400" size={20} />
                  <span className="text-[#e6915b] text-sm">Loyalty</span>
                </div>
                <p className="text-lg font-bold text-white">{stats.loyaltyLevel}</p>
              </div>
            )}
            
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-green-400" size={20} />
                <span className="text-[#e6915b] text-sm">Joined</span>
              </div>
              <p className="text-lg font-bold text-white">{formatJoinDate(user.createdAt)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
