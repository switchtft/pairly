'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerProfileProps {
  user: any; // Will be properly typed later
}

export default function CustomerProfile({ user }: CustomerProfileProps) {
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
    gameNicknames: user.gameNicknames || {}
  });

  const [gameNicknameInputs, setGameNicknameInputs] = useState({
    valorant: '',
    csgo: '',
    league: '',
    overwatch: '',
    fortnite: ''
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [favoriteTeammates, setFavoriteTeammates] = useState([]);
  const [blockedTeammates, setBlockedTeammates] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);

  useEffect(() => {
    fetchCustomerData();
    // Initialize game nickname inputs
    if (user.gameNicknames) {
      setGameNicknameInputs({
        valorant: user.gameNicknames.valorant || '',
        csgo: user.gameNicknames.csgo || '',
        league: user.gameNicknames.league || '',
        overwatch: user.gameNicknames.overwatch || '',
        fortnite: user.gameNicknames.fortnite || ''
      });
    }
  }, [user.gameNicknames]);

  const fetchCustomerData = async () => {
    try {
      // Fetch favorite teammates
      const favoritesResponse = await fetch(`/api/users/favorites?userId=${user.id}&userType=customer`);
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavoriteTeammates(favoritesData.favorites.map((f: any) => f.teammate));
      }

      // Fetch blocked teammates
      const blockedResponse = await fetch(`/api/users/blocked?userId=${user.id}&userType=customer`);
      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json();
        setBlockedTeammates(blockedData.blockedUsers.map((b: any) => b.teammate));
      }

      // Fetch match history
      const matchHistoryResponse = await fetch(`/api/customers/match-history?userId=${user.id}`);
      if (matchHistoryResponse.ok) {
        const matchHistoryData = await matchHistoryResponse.json();
        setMatchHistory(matchHistoryData.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGameNicknameChange = (game: string, nickname: string) => {
    setGameNicknameInputs(prev => ({
      ...prev,
      [game]: nickname
    }));
    
    setFormData(prev => ({
      ...prev,
      gameNicknames: {
        ...prev.gameNicknames,
        [game]: nickname
      }
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage('Password changed successfully!');
        setShowPasswordChange(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password');
    }
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

  const toggleFavorite = async (teammateId: number) => {
    try {
      const isFavorite = favoriteTeammates.some(t => t.id === teammateId);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/users/favorites?userId=${user.id}&targetUserId=${teammateId}&userType=customer`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setFavoriteTeammates(prev => prev.filter(t => t.id !== teammateId));
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
            targetUserId: teammateId,
            userType: 'customer'
          })
        });
        
        if (response.ok) {
          const favoriteData = await response.json();
          // Fetch updated favorites list
          fetchCustomerData();
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const toggleBlocked = async (teammateId: number) => {
    try {
      const isBlocked = blockedTeammates.some(t => t.id === teammateId);
      
      if (isBlocked) {
        // Unblock
        const response = await fetch(`/api/users/blocked?userId=${user.id}&targetUserId=${teammateId}&userType=customer`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setBlockedTeammates(prev => prev.filter(t => t.id !== teammateId));
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
            targetUserId: teammateId,
            userType: 'customer'
          })
        });
        
        if (response.ok) {
          const blockedData = await response.json();
          // Fetch updated blocked list
          fetchCustomerData();
        }
      }
    } catch (error) {
      console.error('Failed to toggle blocked:', error);
    }
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
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${user.accountBalance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Account Balance</div>
              <div className="mt-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  user.loyaltyTier === 'Diamond' ? 'bg-purple-100 text-purple-800' :
                  user.loyaltyTier === 'Platinum' ? 'bg-gray-100 text-gray-800' :
                  user.loyaltyTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                  user.loyaltyTier === 'Silver' ? 'bg-gray-100 text-gray-600' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {user.loyaltyTier || 'Bronze'} Tier
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {user.loyaltyPoints || 0} points
              </div>
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

                  {/* Game Nicknames */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Game Nicknames
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Valorant</label>
                        <input
                          type="text"
                          value={gameNicknameInputs.valorant}
                          onChange={(e) => handleGameNicknameChange('valorant', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Valorant nickname"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">CS:GO</label>
                        <input
                          type="text"
                          value={gameNicknameInputs.csgo}
                          onChange={(e) => handleGameNicknameChange('csgo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="CS:GO nickname"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">League of Legends</label>
                        <input
                          type="text"
                          value={gameNicknameInputs.league}
                          onChange={(e) => handleGameNicknameChange('league', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="LoL nickname"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Overwatch</label>
                        <input
                          type="text"
                          value={gameNicknameInputs.overwatch}
                          onChange={(e) => handleGameNicknameChange('overwatch', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Overwatch nickname"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>
                    
                    {showPasswordChange && (
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter new password"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Update Password
                          </button>
                        </div>
                      </form>
                    )}
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
                  
                  {/* Game Nicknames Display */}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Game Nicknames:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(user.gameNicknames || {}).map(([game, nickname]) => (
                        nickname && (
                          <div key={game} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 capitalize">{game}:</span>
                            <span className="text-gray-900 font-medium">{nickname as string}</span>
                          </div>
                        )
                      ))}
                      {(!user.gameNicknames || Object.keys(user.gameNicknames).length === 0) && (
                        <p className="text-gray-500 text-sm">No game nicknames set</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Lists and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match History</h3>
              {matchHistory.length > 0 ? (
                <div className="space-y-3">
                  {matchHistory.map((match: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{match.date}</span>
                        <span className="text-sm text-gray-600">{match.time}</span>
                        <span className="text-sm font-medium">{match.gameType}</span>
                        <span className={`text-sm font-medium ${
                          match.result === 'W' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {match.result === 'W' ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        ${match.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No match history yet.</p>
              )}
            </div>

            {/* Favorite Teammates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Teammates</h3>
              {favoriteTeammates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteTeammates.map((teammate: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {teammate.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{teammate.username}</p>
                          <p className="text-sm text-gray-600">{teammate.game}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(teammate.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No favorite teammates yet.</p>
              )}
            </div>

            {/* Blocked Teammates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blocked Teammates</h3>
              {blockedTeammates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blockedTeammates.map((teammate: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-medium">
                            {teammate.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{teammate.username}</p>
                          <p className="text-sm text-gray-600">{teammate.game}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBlocked(teammate.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No blocked teammates.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
