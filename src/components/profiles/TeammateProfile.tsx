'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeammateProfileProps {
  user: { id: number; username: string; email: string; firstName?: string; lastName?: string; bio?: string; discord?: string; steam?: string; timezone?: string; languages?: string; hourlyRate?: number; availability?: string }; // Will be properly typed later
}

export default function TeammateProfile({ user }: TeammateProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    discord: user.discord || '',
    steam: user.steam || '',
    timezone: user.timezone || '',
    languages: user.languages || 'English',
    hourlyRate: user.hourlyRate?.toString() || '',
    availability: user.availability || ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [favoriteCustomers, setFavoriteCustomers] = useState<Array<{ id: number; username: string; game: string; rank?: string; rating?: number }>>([]);
  const [blockedCustomers, setBlockedCustomers] = useState<Array<{ id: number; username: string; game: string; rank?: string; rating?: number }>>([]);

  useEffect(() => {
    fetchTeammateData();
  }, []);

  const fetchTeammateData = async () => {
    try {
      // Fetch favorite customers
      const favoritesResponse = await fetch(`/api/users/favorites?userId=${user.id}&userType=teammate`);
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavoriteCustomers(favoritesData.favorites.map((f: { customer: { id: number; username: string; game: string; rank?: string; rating?: number } }) => f.customer));
      }

      // Fetch blocked customers
      const blockedResponse = await fetch(`/api/users/blocked?userId=${user.id}&userType=teammate`);
      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        setBlockedCustomers(blockedData.blockedUsers.map((b: { customer: { id: number; username: string; game: string; rank?: string; rating?: number } }) => b.customer));
      }
    } catch (error) {
      console.error('Failed to fetch teammate data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // API call to update profile will be implemented later
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (customerId: number) => {
    try {
      const isFavorite = favoriteCustomers.some(c => c.id === customerId);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/users/favorites?userId=${user.id}&targetUserId=${customerId}&userType=teammate`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setFavoriteCustomers(prev => prev.filter(c => c.id !== customerId));
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/users/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            targetUserId: customerId,
            userType: 'teammate'
          })
        });
        
        if (response.ok) {
          const favoriteData = await response.json();
          // Fetch updated favorites list
          fetchTeammateData();
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const toggleBlocked = async (customerId: number) => {
    try {
      const isBlocked = blockedCustomers.some(c => c.id === customerId);
      
      if (isBlocked) {
        // Unblock
        const response = await fetch(`/api/users/blocked?userId=${user.id}&targetUserId=${customerId}&userType=teammate`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setBlockedCustomers(prev => prev.filter(c => c.id !== customerId));
        }
      } else {
        // Block
        const response = await fetch('/api/users/blocked', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            targetUserId: customerId,
            userType: 'teammate'
          })
        });
        
        if (response.ok) {
          const blockedData = await response.json();
          // Fetch updated blocked list
          fetchTeammateData();
        }
      }
    } catch (error) {
      console.error('Failed to toggle blocked:', error);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-gray-600">
                      {user.firstName?.[0] || user.username[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.username
                  }
                </h1>
                <p className="text-gray-600">@{user.username}</p>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Teammate
                  </span>
                  {user.isOnline && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Online
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${user.hourlyRate?.toFixed(2) || '0.00'}/hr
              </div>
              <div className="text-sm text-gray-600">Hourly Rate</div>
              <button
                onClick={goToDashboard}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discord
                      </label>
                      <input
                        type="text"
                        name="discord"
                        value={formData.discord}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Discord username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Steam
                      </label>
                      <input
                        type="text"
                        name="steam"
                        value={formData.steam}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Steam username"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <input
                        type="text"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., UTC-5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Languages
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., English, Spanish"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Weekdays 6-10 PM"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Bio:</span>
                    <p className="text-gray-900">{user.bio || 'No bio added yet.'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Discord:</span>
                    <p className="text-gray-900">{user.discord || 'Not connected'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Steam:</span>
                    <p className="text-gray-900">{user.steam || 'Not connected'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Timezone:</span>
                    <p className="text-gray-900">{user.timezone || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Languages:</span>
                    <p className="text-gray-900">{user.languages || 'English'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hourly Rate:</span>
                    <p className="text-gray-900">${user.hourlyRate?.toFixed(2) || '0.00'}/hr</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Availability:</span>
                    <p className="text-gray-900">{user.availability || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorite Customers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Customers</h3>
              {favoriteCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteCustomers.map((customer: { id: number; username: string; game: string; rank?: string; rating?: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.username}</p>
                          <p className="text-sm text-gray-600">{customer.game}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(customer.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No favorite customers yet.</p>
              )}
            </div>

            {/* Blocked Customers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blocked Customers</h3>
              {blockedCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blockedCustomers.map((customer: { id: number; username: string; game: string; rank?: string; rating?: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-medium">
                            {customer.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.username}</p>
                          <p className="text-sm text-gray-600">{customer.game}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBlocked(customer.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No blocked customers.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
