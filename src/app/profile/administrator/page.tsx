// src/app/profile/administrator/page.tsx
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
  Settings,
  BarChart3,
  Users2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { AdministratorProfile } from '@/lib/types';

// Placeholder data for Phase 1
const placeholderAdminProfile: AdministratorProfile = {
  id: 3,
  email: 'admin@pairly.com',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  avatar: '',
  bio: 'System Administrator with full platform access and management capabilities.',
  permissions: [
    'manage_users',
    'view_orders',
    'manage_teammates',
    'system_settings',
    'analytics_access',
    'content_moderation'
  ],
  createdAt: '2023-01-01T00:00:00Z',
  lastSeen: new Date().toISOString()
};

export default function AdministratorProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<AdministratorProfile>(placeholderAdminProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // In Phase 1, we use placeholder data
    setFormData({
      firstName: adminProfile.firstName || '',
      lastName: adminProfile.lastName || '',
      username: adminProfile.username || '',
      bio: adminProfile.bio || '',
    });
  }, [user, isLoading, isAuthenticated, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In Phase 1, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAdminProfile(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        bio: formData.bio,
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
          user={adminProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
          onAvatarUpload={handleAvatarUpload}
          showStats={false}
        />

        {/* Admin Tools Placeholder */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-8">
          <div className="text-center">
            <Shield className="mx-auto mb-4 text-[#e6915b]" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">Administrator Tools</h2>
            <p className="text-gray-400 mb-6">Advanced management features will be available in future phases.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                <Users2 className="mx-auto mb-2 text-[#e6915b]" size={32} />
                <h3 className="text-white font-semibold mb-1">User Management</h3>
                <p className="text-sm text-gray-400">Manage customers and teammates</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                <BarChart3 className="mx-auto mb-2 text-[#e6915b]" size={32} />
                <h3 className="text-white font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-gray-400">Platform statistics and insights</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                <FileText className="mx-auto mb-2 text-[#e6915b]" size={32} />
                <h3 className="text-white font-semibold mb-1">Content Moderation</h3>
                <p className="text-sm text-gray-400">Review and manage content</p>
              </div>
            </div>
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
                  <span className="text-[#e6915b]/80">{adminProfile.email}</span>
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
                    {adminProfile.firstName || 'Not set'}
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
                    {adminProfile.lastName || 'Not set'}
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
                  <p className="text-[#e6915b]/80 p-3 bg-[#2a2a2a] rounded-lg">@{adminProfile.username}</p>
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
                    {adminProfile.bio || 'No bio set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Shield className="text-[#e6915b]" size={20} />
              Administrator Permissions
            </h2>

            <div className="space-y-4">
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Current Permissions</h3>
                <div className="grid grid-cols-1 gap-2">
                  {adminProfile.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 capitalize">
                        {permission.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Platform Status</span>
                    <span className="text-green-400 font-semibold">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Last Maintenance</span>
                    <span className="text-gray-400">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-gray-400">1,247</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 font-semibold">Development Notice</span>
                </div>
                <p className="text-yellow-400/80 text-sm">
                  Advanced administrator features are currently in development and will be available in future phases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Settings className="text-[#e6915b]" size={20} />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
              disabled
            >
              <Users2 size={24} />
              <span>User Management</span>
              <span className="text-xs opacity-60">Coming Soon</span>
            </Button>

            <Button 
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
              disabled
            >
              <BarChart3 size={24} />
              <span>Analytics</span>
              <span className="text-xs opacity-60">Coming Soon</span>
            </Button>

            <Button 
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
              disabled
            >
              <FileText size={24} />
              <span>Content Mod</span>
              <span className="text-xs opacity-60">Coming Soon</span>
            </Button>

            <Button 
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
              disabled
            >
              <Settings size={24} />
              <span>System Settings</span>
              <span className="text-xs opacity-60">Coming Soon</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
