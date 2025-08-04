// src/app/duo/page.tsx
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Users, Crown, Shield, Star, Plus, X, Wifi, WifiOff } from 'lucide-react';
import { calculateBundleDiscount, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import BookingModal from '@/components/BookingModal';
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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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

function convertDbUserToPlayer(dbUser: DbUser): Player {
  return {
    id: dbUser.id.toString(),
    name: dbUser.username,
    rank: dbUser.rank || 'Unranked',
    winRate: '65%', // Mock data
    mainRole: dbUser.role || 'Flex',
    secondaryRole: 'Support',
    online: true, // Mock data
    lastOnline: '2 minutes ago',
    personalPrice: '$25',
    inQueue: false,
    queuePrice: '$20',
    game: dbUser.game || 'valorant',
    verified: true, // Mock data
  };
}

function PlayerCard({ player, onBookNow, onJoinQueue, isLoading }: {
  player: Player;
  onBookNow: (id: string) => void;
  onJoinQueue: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 p-5 hover:border-[#e6915b]/50 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#e6915b] to-[#d17a4a] rounded-full flex items-center justify-center">
          <span className="text-[#1a1a1a] font-bold text-lg">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#e6915b]">{player.name}</h3>
            {player.verified && (
              <Shield className="w-4 h-4 text-[#e6915b]" />
            )}
          </div>
          <p className="text-[#e6915b]/60 text-sm">{player.rank}</p>
        </div>
        <div className="ml-auto">
          <div className={`w-3 h-3 rounded-full ${player.online ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-[#e6915b]/60">Win Rate</p>
          <p className="text-[#e6915b] font-semibold">{player.winRate}</p>
        </div>
        <div>
          <p className="text-[#e6915b]/60">Main Role</p>
          <p className="text-[#e6915b] font-semibold">{player.mainRole}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onBookNow(player.id)}
          disabled={isLoading}
          className="flex-1 bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
        >
          {isLoading ? (
            <LoadingSpinner size={16} />
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Book Now
            </>
          )}
        </Button>
        <Button
          onClick={() => onJoinQueue(player.id)}
          disabled={isLoading}
          variant="outline"
          className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
        >
          {isLoading ? (
            <LoadingSpinner size={16} />
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Join Queue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function DuoPage() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState('valorant');
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [queueStats, setQueueStats] = useState({
    queueLength: 0,
    estimatedWaitTime: 0,
    availableTeammates: 0,
  });

  // WebSocket connection
  const { isConnected, joinQueue: joinSocketQueue, leaveQueue: leaveSocketQueue } = useSocket();

  // Real-time queue updates
  useSocketEvent('queue:update', (data) => {
    console.log('Queue update received:', data);
    setQueueStats(data);
  });

  // Real-time match notifications
  useSocketEvent('match:found', (data) => {
    setCurrentSessionId(data.sessionId);
    setShowChat(true);
    alert(`🎉 Match found! You've been paired with ${data.teammate.username} (${data.teammate.rank})`);
  });

  // Real-time teammate status updates
  useSocketEvent('teammate:online', (data) => {
    console.log(`Teammate ${data.username} is now online for ${data.game}`);
    // You could update the players list here to show real-time status
  });

  useSocketEvent('teammate:offline', (data) => {
    console.log(`Teammate ${data.username} is now offline`);
    // You could update the players list here to show real-time status
  });

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

  // Join WebSocket queue when game changes
  useEffect(() => {
    if (isConnected && user) {
      joinSocketQueue(selectedGame, 'duo');
    }
  }, [isConnected, selectedGame, user, joinSocketQueue]);

  // Filter players by selected game
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.game === selectedGame);
  }, [players, selectedGame]);

  // Get online players count
  const onlinePlayersCount = useMemo(() => {
    return players.filter(p => p.online && p.game === selectedGame).length;
  }, [players, selectedGame]);

  // Handle booking completion
  const handleBookingComplete = useCallback((queueEntryId: number) => {
    console.log('Booking completed, queue entry ID:', queueEntryId);
    // The user is now in the queue, you can show queue status or redirect
    alert('Booking completed! You are now in the queue.');
  }, []);

  // Handle player actions
  const handleBookNow = useCallback(async (playerId: string) => {
    if (!user) {
      alert('Please log in to book a session');
      return;
    }
    setShowBookingModal(true);
  }, [user]);

  const handleJoinPlayerQueue = useCallback(async (playerId: string) => {
    if (!user) {
      alert('Please log in to join the queue');
      return;
    }
    setShowBookingModal(true);
  }, [user]);

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

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isConnected 
              ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
              : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">
              {isConnected ? 'Real-time Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Game Selector */}
        <GameSelector selectedGame={selectedGame} onGameSelect={setSelectedGame} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#e6915b]" />
              <div>
                <p className="text-[#e6915b]/60 text-sm">Online Players</p>
                <p className="text-[#e6915b] text-2xl font-bold">{onlinePlayersCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#e6915b]" />
              <div>
                <p className="text-[#e6915b]/60 text-sm">Queue Time</p>
                <p className="text-[#e6915b] text-2xl font-bold">
                  {queueStats.estimatedWaitTime}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-[#e6915b]" />
              <div>
                <p className="text-[#e6915b]/60 text-sm">In Queue</p>
                <p className="text-[#e6915b] text-2xl font-bold">{queueStats.queueLength}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Book Button */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowBookingModal(true)}
            disabled={!user}
            className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-8 py-4 text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Quick Book Session
          </Button>
          {!user && (
            <p className="text-[#e6915b]/60 mt-2">Please log in to book a session</p>
          )}
        </div>

        {/* Players Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6915b] mb-6">
            Available Players
          </h2>
          
          {loadingPlayers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={Users}
              title="Failed to load players"
              message={error}
            />
          ) : filteredPlayers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No players available"
              message="Check back later for available players"
            />
          ) : (
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

        {/* Queue Status */}
        {queueStats.queueLength > 0 && (
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/30 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#e6915b] font-semibold text-lg mb-2">
                  Queue Status
                </h3>
                <p className="text-[#e6915b]/60">
                  {queueStats.queueLength} people in queue • {queueStats.availableTeammates} teammates available
                </p>
                <p className="text-[#e6915b]/60">
                  Estimated wait time: {queueStats.estimatedWaitTime} minutes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Live Updates</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingComplete={handleBookingComplete}
        game={selectedGame}
      />

      {/* Chat Modal */}
      {showChat && currentSessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#e6915b]/20">
              <h3 className="text-[#e6915b] font-semibold">Chat with your teammate</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-[#e6915b]/60 hover:text-[#e6915b]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <EnhancedChatInterface 
                sessionId={currentSessionId} 
                teammate={{
                  id: 1, // This would come from the actual session data
                  username: "ProTeammate",
                  rank: "Diamond",
                  isOnline: true
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}