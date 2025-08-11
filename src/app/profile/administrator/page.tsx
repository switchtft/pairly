// src/app/profile/administrator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/ProfileHeader';
import { Button } from '@/components/ui/button';
import AdminOrdersView from '@/components/AdminOrdersView';
import AdminTeammatesView from '@/components/AdminTeammatesView';
import AdminUserManagement from '@/components/AdminUserManagement';
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
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react';
import { AdministratorProfile } from '@/lib/types';

export default function AdministratorProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<AdministratorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'teammates' | 'users'>('profile');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
  });

  // Fetch admin profile data
  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      const userData = data.user;
      
      // Transform user data to AdministratorProfile format
      const adminData: AdministratorProfile = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        bio: userData.bio,
        permissions: [
          'manage_users',
          'view_orders',
          'manage_teammates',
          'system_settings',
          'analytics_access',
          'content_moderation'
        ],
        createdAt: userData.createdAt,
        lastSeen: userData.lastSeen
      };
      
      setAdminProfile(adminData);
      setFormData({
        firstName: adminData.firstName || '',
        lastName: adminData.lastName || '',
        username: adminData.username || '',
        bio: adminData.bio || '',
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only administrators can access the admin profile
    if (user && user.role !== 'administrator') {
      router.push('/profile');
      return;
    }

    if (isAuthenticated && user?.role === 'administrator') {
      fetchAdminProfile();
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update local state with the response data
      if (adminProfile) {
        setAdminProfile(prev => prev ? {
          ...prev,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          username: data.user.username,
          bio: data.user.bio,
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
        if (adminProfile) {
          setAdminProfile(prev => prev ? {
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

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  if (!adminProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-white">Failed to load admin profile</p>
        </div>
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

        {/* Admin Dashboard Tabs */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('profile')}
              variant={activeTab === 'profile' ? 'default' : 'outline'}
              className={`${
                activeTab === 'profile'
                  ? 'bg-[#e6915b] text-white'
                  : 'border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white'
              }`}
            >
              <User className="mr-2" size={16} />
              Profile
            </Button>
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              className={`${
                activeTab === 'orders'
                  ? 'bg-[#e6915b] text-white'
                  : 'border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white'
              }`}
            >
              <Clock className="mr-2" size={16} />
              Orders
            </Button>
            <Button
              onClick={() => setActiveTab('teammates')}
              variant={activeTab === 'teammates' ? 'default' : 'outline'}
              className={`${
                activeTab === 'teammates'
                  ? 'bg-[#e6915b] text-white'
                  : 'border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white'
              }`}
            >
              <Users className="mr-2" size={16} />
              Teammates
            </Button>
            <Button
              onClick={() => setActiveTab('users')}
              variant={activeTab === 'users' ? 'default' : 'outline'}
              className={`${
                activeTab === 'users'
                  ? 'bg-[#e6915b] text-white'
                  : 'border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white'
              }`}
            >
              <Users2 className="mr-2" size={16} />
              User Management
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-[#2a2a2a] rounded-2xl border border-[#333] p-6">
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
                    <div className="flex items-center gap-2 p-3 bg-[#333] rounded-lg">
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
                        className="w-full bg-[#333] rounded-lg px-4 py-3 border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-[#e6915b]/80 p-3 bg-[#333] rounded-lg">
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
                        className="w-full bg-[#333] rounded-lg px-4 py-3 border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-[#e6915b]/80 p-3 bg-[#333] rounded-lg">
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
                        className="w-full bg-[#333] rounded-lg px-4 py-3 border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all text-white"
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="text-[#e6915b]/80 p-3 bg-[#333] rounded-lg">@{adminProfile.username}</p>
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
                        className="w-full bg-[#333] rounded-lg px-4 py-3 border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all resize-none text-white"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-[#e6915b]/80 p-3 bg-[#333] rounded-lg min-h-[80px]">
                        {adminProfile.bio || 'No bio set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-[#2a2a2a] rounded-2xl border border-[#333] p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <Shield className="text-[#e6915b]" size={20} />
                  Administrator Permissions
                </h2>

                <div className="space-y-4">
                  <div className="bg-[#333] rounded-lg p-4">
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

                  <div className="bg-[#333] rounded-lg p-4">
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <AdminOrdersView />}
          {activeTab === 'teammates' && <AdminTeammatesView />}
          {activeTab === 'users' && <AdminUserManagement />}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <LayoutDashboard className="text-[#e6915b]" size={20} />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => setActiveTab('orders')}
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
            >
              <Clock size={24} />
              <span>View Orders</span>
              <span className="text-xs opacity-60">Real-time</span>
            </Button>

            <Button 
              onClick={() => setActiveTab('teammates')}
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users size={24} />
              <span>Teammates</span>
              <span className="text-xs opacity-60">Online status</span>
            </Button>

            <Button 
              onClick={() => setActiveTab('users')}
              variant="outline" 
              className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b] hover:text-white h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users2 size={24} />
              <span>User Management</span>
              <span className="text-xs opacity-60">Manage roles</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
