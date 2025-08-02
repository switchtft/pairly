// src/app/duo/page.tsx
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, User, Play, Users, Crown, Shield, Star } from 'lucide-react';
import { calculateBundleDiscount, formatCurrency, getRankColor } from '@/lib/utils';
import React from 'react';

// Simplified components to avoid import issues
function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div 
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-600 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-600 rounded w-16"></div>
      </div>
      <div className="h-12 bg-gray-600 rounded"></div>
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  message 
}: { 
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // ✅ Fixed type
  title: string; 
  message: string; 
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Simple game selector
function GameSelector({ selectedGame, onGameSelect }: {
  selectedGame: string;
  onGameSelect: (game: string) => void;
}) {
  const games = [
    { id: 'valorant', name: 'Valorant' },
    { id: 'league', name: 'League of Legends' },
  ];

  return (
    <div className="flex justify-center gap-4 mb-8">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game.id)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            selectedGame === game.id
              ? 'bg-[#e6915b] text-[#1a1a1a]'
              : 'bg-[#2a2a2a] text-[#e6915b] hover:bg-[#e6915b]/20'
          }`}
        >
          {game.name}
        </button>
      ))}
    </div>
  );
}

// Types for database users
interface DbUser {
  id: number;
  username: string;
  rank: string | null;
  game: string | null;
  role: string | null;
  isPro: boolean;
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  rank: string;
  winRate: string;
  mainRole: string;
  secondaryRole: string;
  online: boolean;
  lastOnline: string;
  personalPrice: string;
  inQueue: boolean;
  queuePrice: string;
  game: string;
  verified?: boolean;
}

// Convert database user to player format
function convertDbUserToPlayer(dbUser: DbUser): Player {
  const winRates = ['67%', '72%', '61%', '80%', '75%', '69%', '74%'];
  const prices = ['$12', '$15', '$18', '$20', '$16', '$14', '$22'];
  const secondaryRoles: Record<string, string> = {
    'Duelist': 'Initiator',
    'Controller': 'Sentinel', 
    'Initiator': 'Duelist',
    'Sentinel': 'Controller',
    'Jungle': 'Top',
    'Top': 'Mid',
    'Mid': 'ADC',
    'ADC': 'Support',
    'Support': 'Jungle'
  };

  // Fixed random generation - use player ID for consistency
  const seed = dbUser.id;
  const isOnline = (seed % 3) !== 0; // ~66% online
  const inQueue = isOnline && (seed % 2) === 0; // 50% of online players in queue

  return {
    id: dbUser.id.toString(),
    name: dbUser.username,
    rank: dbUser.rank || 'Unranked',
    winRate: winRates[seed % winRates.length],
    mainRole: dbUser.role || 'Flex',
    secondaryRole: secondaryRoles[dbUser.role || ''] || 'Flex',
    online: isOnline,
    lastOnline: isOnline ? 'Online now' : `${(seed % 12) + 1} hours ago`,
    personalPrice: prices[seed % prices.length],
    inQueue,
    queuePrice: '$10',
    game: dbUser.game || 'valorant',
    verified: (seed % 2) === 0
  };
}

// Enhanced Player Card Component
function PlayerCard({ player, onBookNow, onJoinQueue, isLoading }: {
  player: Player;
  onBookNow: (id: string) => void;
  onJoinQueue: (id: string) => void;
  isLoading: boolean;
}) {
  const isHighRank = player.rank.includes('Radiant') || 
                   player.rank.includes('Grandmaster') || 
                   player.rank.includes('Challenger');

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 hover:border-[#e6915b]/70 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg relative">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-[#2a2a2a] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-[#e6915b] border-2 border-[#e6915b]/30">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1a1a] ${
                player.online ? "bg-green-500" : "bg-gray-400"
              }`} />
            </div>
            
            <div>
              <h3 className="font-bold text-lg flex items-center text-[#e6915b]">
                {player.name}
                {player.verified && <Shield className="ml-2 text-blue-400" size={16} />}
                {isHighRank && <Crown className="ml-2 text-yellow-400" size={16} />}
              </h3>
              
              <div className="flex items-center mt-1 text-sm">
                <span className="font-medium text-purple-400">
                  {player.rank}
                </span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-green-500 flex items-center">
                  <Star className="mr-1" size={12} />
                  {player.winRate} WR
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <Clock size={12} className="mr-1" />
                {player.online ? 'Online now' : `Last seen: ${player.lastOnline}`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Roles */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-20 flex-shrink-0">Main:</span>
            <span className="font-medium text-[#e6915b] bg-[#e6915b]/10 px-2 py-1 rounded">
              {player.mainRole}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-20 flex-shrink-0">Alt:</span>
            <span className="font-medium text-[#6b8ab0] bg-[#6b8ab0]/10 px-2 py-1 rounded">
              {player.secondaryRole}
            </span>
          </div>
        </div>
        
        {/* Pricing and Actions */}
        <div className="space-y-3">
          {/* Personal Rate */}
          <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <div className="text-sm text-gray-400">Personal Rate</div>
              <div className="text-lg font-bold text-[#e6915b]">
                {player.personalPrice}
                <span className="text-sm font-normal ml-1 text-gray-500">/hr</span>
              </div>
            </div>
            <Button 
              onClick={() => onBookNow(player.id)}
              disabled={isLoading || !player.online}
              className="bg-[#e6915b] hover:bg-[#d18251] text-[#1a1a1a] rounded-xl px-4 py-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size={16} /> : 'Book Now'}
            </Button>
          </div>
          
          {/* Queue Rate */}
          {player.inQueue && (
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg border border-green-500/30">
              <div>
                <div className="text-sm text-green-400 flex items-center">
                  Queue Rate
                  <span className="ml-2 bg-green-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                    SAVE {((parseFloat(player.personalPrice.replace('$', '')) - parseFloat(player.queuePrice.replace('$', ''))) / parseFloat(player.personalPrice.replace('$', '')) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-lg font-bold text-green-300">
                  {player.queuePrice}
                  <span className="text-sm font-normal ml-1 text-gray-400">/hr</span>
                </div>
              </div>
              <Button 
                onClick={() => onJoinQueue(player.id)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2"
              >
                {isLoading ? <LoadingSpinner size={16} /> : 'Join Queue'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Offline overlay */}
        {!player.online && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-300 font-medium mb-1">Currently Offline</div>
              <div className="text-gray-400 text-sm">Last seen: {player.lastOnline}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DuoPage() {
  const [selectedGame, setSelectedGame] = useState('valorant');
  const [bundleSize, setBundleSize] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch players from database
  const fetchPlayers = useCallback(async (game?: string) => {
    console.log('Fetching players for game:', game);
    setLoadingPlayers(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (game) params.append('game', game);
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch players');
      
      const dbUsers: DbUser[] = await response.json();
      const convertedPlayers = dbUsers.map(convertDbUserToPlayer);
      setPlayers(convertedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players. Please try again.');
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  // Load players on mount and game change
  useEffect(() => {
    fetchPlayers(selectedGame);
  }, [selectedGame, fetchPlayers]);

  // Filter players by selected game
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.game === selectedGame);
  }, [players, selectedGame]);

  // Get online players count
  const onlinePlayersCount = useMemo(() => {
    return players.filter(p => p.online && p.game === selectedGame).length;
  }, [players, selectedGame]);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculateBundleDiscount(bundleSize, 10);
  }, [bundleSize]);

  // Handle bundle size changes
  const handleBundleSizeChange = useCallback((change: number) => {
    setBundleSize(prev => Math.max(1, Math.min(10, prev + change)));
  }, []);

  // Handle player actions
  const handleBookNow = useCallback(async (playerId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Booked player:', playerId);
      alert(`Booked player ${playerId}!`);
    } catch (error) {
      console.error('Failed to book player:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleJoinPlayerQueue = useCallback(async (playerId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Joined queue with player:', playerId);
      alert(`Joined queue with player ${playerId}!`);
    } catch (error) {
      console.error('Failed to join player queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#e6915b] mb-3">
            Find Your Perfect Duo Partner
          </h1>
          <p className="text-[#e6915b]/80 max-w-2xl mx-auto text-lg">
            Connect with skilled players who match your playstyle
          </p>
        </div>
        
        {/* Game Selector */}
        <GameSelector 
          selectedGame={selectedGame}
          onGameSelect={setSelectedGame}
        />
        
        {/* Bundle Size Selector */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-8 border-2 border-[#e6915b]/30">
          <h3 className="text-xl font-semibold mb-4 text-center text-[#e6915b]">
            Bundle Size
          </h3>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleBundleSizeChange(-1)}
              disabled={bundleSize <= 1}
              className="w-10 h-10 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            
            <div className="text-2xl font-bold bg-[#2a2a2a] px-6 py-2 rounded-xl border-2 border-[#e6915b]/30 text-[#e6915b]">
              {bundleSize} Game{bundleSize > 1 ? 's' : ''}
            </div>
            
            <button
              onClick={() => handleBundleSizeChange(1)}
              disabled={bundleSize >= 10}
              className="w-10 h-10 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-[#e6915b] font-bold text-xl">
              Total: {formatCurrency(pricing.totalPrice)}
            </span>
            {pricing.discountPercent > 0 && (
              <span className="ml-2 text-green-400">
                (Save {pricing.discountPercent}%)
              </span>
            )}
          </div>
        </div>
        
        {/* Available Players */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#e6915b]">Available Players</h2>
            <div className="text-sm text-[#e6915b]/80">
              {onlinePlayersCount} online • {filteredPlayers.filter(p => p.inQueue).length} in queue
            </div>
          </div>
          
          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-6">
              <div className="text-red-400 text-center">
                <p className="mb-4">{error}</p>
                <Button 
                  onClick={() => fetchPlayers(selectedGame)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loadingPlayers && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loadingPlayers && !error && filteredPlayers.length === 0 && (
            <EmptyState 
              icon={Users}
              title="No players available"
              message={`No players are currently available for ${selectedGame}`}
            />
          )}
          
          {/* Players Grid */}
          {!loadingPlayers && !error && filteredPlayers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onBookNow={handleBookNow}
                  onJoinQueue={handleJoinPlayerQueue}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}