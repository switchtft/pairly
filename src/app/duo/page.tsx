// src/app/duo/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';
import { LoadingSpinner, EmptyState, CardSkeleton } from '@/components/LoadingStates';
import { Button } from '@/components/ui/button';
import { Clock, User, Play, Users, Crown, Shield, Star } from 'lucide-react';
import { useQueue, useLocalStorage } from '@/hooks';
import { GAMES } from '@/lib/games';
import { calculateBundleDiscount, formatCurrency, getRankColor } from '@/lib/utils';

// Mock player data - in real app this would come from API
const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'CapyChill',
    rank: 'Diamond 3',
    winRate: '67%',
    mainRole: 'Duelist',
    secondaryRole: 'Initiator',
    online: true,
    lastOnline: 'Online now',
    personalPrice: '$15',
    inQueue: true,
    queuePrice: '$10',
    game: 'valorant',
    verified: true
  },
  {
    id: '2',
    name: 'CapyZen',
    rank: 'Immortal 1',
    winRate: '72%',
    mainRole: 'Controller',
    secondaryRole: 'Sentinel',
    online: true,
    lastOnline: 'Online now',
    personalPrice: '$18',
    inQueue: true,
    queuePrice: '$10',
    game: 'valorant',
    verified: true
  },
  {
    id: '3',
    name: 'CapyNap',
    rank: 'Ascendant 2',
    winRate: '61%',
    mainRole: 'Initiator',
    secondaryRole: 'Duelist',
    online: false,
    lastOnline: '3 hours ago',
    personalPrice: '$12',
    inQueue: false,
    queuePrice: '$10',
    game: 'valorant'
  },
  {
    id: '4',
    name: 'CapyKing',
    rank: 'Radiant',
    winRate: '80%',
    mainRole: 'Sentinel',
    secondaryRole: 'Controller',
    online: true,
    lastOnline: 'Online now',
    personalPrice: '$20',
    inQueue: false,
    queuePrice: '$10',
    game: 'valorant',
    verified: true
  },
  {
    id: '5',
    name: 'CapyLeaf',
    rank: 'Master',
    winRate: '75%',
    mainRole: 'Jungle',
    secondaryRole: 'Top',
    online: true,
    lastOnline: 'Online now',
    personalPrice: '$16',
    inQueue: true,
    queuePrice: '$12',
    game: 'league',
    verified: true
  },
];

// Enhanced Player Card Component
function PlayerCard({ player, onBookNow, onJoinQueue, isLoading }: {
  player: typeof MOCK_PLAYERS[0];
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
                <span className={`font-medium ${getRankColor(player.rank)}`}>
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
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useLocalStorage('duo-selected-game', 'valorant');
  const [bundleSize, setBundleSize] = useLocalStorage('duo-bundle-size', 1);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    isInQueue,
    queueTime,
    matchFound,
    searching,
    joinQueue,
    leaveQueue,
    resetQueue,
    formatTime
  } = useQueue({
    onMatchFound: () => console.log('Match found!'),
    minMatchTime: 8000,
    maxMatchTime: 15000
  });

  // Filter players by selected game
  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter(p => 
      p.game === selectedGame && (p.inQueue || !isInQueue)
    );
  }, [selectedGame, isInQueue]);

  // Get online players count
  const onlinePlayersCount = useMemo(() => {
    return MOCK_PLAYERS.filter(p => p.online && p.game === selectedGame).length;
  }, [selectedGame]);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculateBundleDiscount(bundleSize, 10);
  }, [bundleSize]);

  // Handle bundle size changes
  const handleBundleSizeChange = useCallback((change: number) => {
    setBundleSize(prev => Math.max(1, Math.min(10, prev + change)));
  }, [setBundleSize]);

  // Handle joining queue
  const handleJoinQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      joinQueue();
    } catch (error) {
      console.error('Failed to join queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, [joinQueue]);

  // Handle player actions
  const handleBookNow = useCallback(async (playerId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Booked player:', playerId);
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
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-16 bg-[#e6915b] rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-[#5a3d2b] rounded-full mr-2"></div>
                <div className="w-6 h-6 bg-[#5a3d2b] rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                <div className="w-8 h-8 bg-[#e6915b] rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#e6915b] mb-3">
            Find Your Perfect Duo Partner
          </h1>
          <p className="text-[#e6915b]/80 max-w-2xl mx-auto text-lg">
            Connect with skilled players who match your playstyle
          </p>
        </div>
        
        {/* Game Selector */}
        <div className="mb-8 md:mb-12">
          <HorizontalGameSelector 
            games={GAMES.map(game => ({ ...game, imageUrl: game.imageUrl || '' }))}
            onGameSelect={setSelectedGame}
            selectedGameId={selectedGame}
          />
        </div>
        
        {/* Queue System */}
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border-2 border-[#e6915b]/30 shadow-lg mb-10">
          <div className="p-5 sm:p-6 bg-[#e6915b]">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center text-[#1a1a1a]">
              <Clock className="mr-2" size={24} />
              Queue System
            </h2>
            <p className="text-[#1a1a1a]/90 mt-1 text-center text-base">
              Get matched with teammates at a discounted rate
            </p>
          </div>
          
          <div className="p-5 sm:p-6">
            {!isInQueue ? (
              <div>
                {/* Bundle Size Selector */}
                <div className="mb-6">
                  <h3 className="text-md sm:text-lg font-semibold mb-3 text-center text-[#e6915b]">
                    How many games do you want to play?
                  </h3>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleBundleSizeChange(-1)}
                      disabled={bundleSize <= 1}
                      className="w-12 h-12 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-2xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    
                    <div className="text-3xl font-bold bg-[#2a2a2a] px-8 py-3 rounded-xl border-2 border-[#e6915b]/30 text-[#e6915b]">
                      {bundleSize} Game{bundleSize > 1 ? 's' : ''}
                    </div>
                    
                    <button
                      onClick={() => handleBundleSizeChange(1)}
                      disabled={bundleSize >= 10}
                      className="w-12 h-12 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-2xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-[#2a2a2a] rounded-xl p-4 sm:p-5 mb-6 border-2 border-[#e6915b]/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md sm:text-lg font-semibold text-[#e6915b]">Order Summary</h4>
                    <span className="text-[#e6915b] font-bold text-2xl">
                      {formatCurrency(pricing.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#e6915b]/80 text-sm mb-2">
                    <span>{bundleSize} game{bundleSize > 1 ? 's' : ''} × $10/game</span>
                    <span className="text-[#e6915b] font-medium">
                      {pricing.discountPercent > 0 && `Save ${pricing.discountPercent}%`}
                    </span>
                  </div>
                  {pricing.discountPercent > 0 && (
                    <div className="flex justify-between text-gray-500 text-sm line-through">
                      <span>Original price:</span>
                      <span>{formatCurrency(pricing.originalPrice)}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleJoinQueue}
                  disabled={isLoading}
                  className="w-full bg-[#e6915b] hover:bg-[#d18251] py-4 text-lg font-bold text-[#1a1a1a] shadow-lg hover:shadow-[#e6915b]/40 transition-all rounded-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size={20} />
                      Joining Queue...
                    </>
                  ) : (
                    <>
                      <Users size={20} />
                      Join Queue - {formatCurrency(pricing.totalPrice)}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Queue Status */
              <div className="text-center">
                {!matchFound ? (
                  <div>
                    <div className="mb-6">
                      <div className="w-16 h-16 border-4 border-[#e6915b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-[#e6915b] mb-2">
                        {searching ? 'Finding teammates...' : 'In Queue'}
                      </h3>
                      <p className="text-[#e6915b]/80 mb-4">
                        Queue time: {Math.floor(queueTime / 1000)}s
                      </p>
                      <p className="text-sm text-gray-400">
                        {onlinePlayersCount} players online in {GAMES.find(g => g.id === selectedGame)?.name || selectedGame}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={leaveQueue}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl px-6 py-2"
                    >
                      Leave Queue
                    </Button>
                  </div>
                ) : (
                  /* Match Found */
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6">
                    <div className="text-green-400 text-4xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Match Found!</h3>
                    <p className="text-green-300 mb-6">
                      We found you a teammate! Get ready to play.
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={resetQueue}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2"
                      >
                        <Play className="mr-2" size={16} />
                        Start Game
                      </Button>
                      <Button 
                        onClick={resetQueue}
                        variant="outline"
                        className="border-gray-500 text-gray-400 hover:bg-gray-600 hover:text-white rounded-xl px-6 py-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
          
          {filteredPlayers.length === 0 ? (
            <EmptyState 
              icon={Users}
              title="No players available"
              message={`No players are currently available for ${GAMES.find(g => g.id === selectedGame)?.name || selectedGame}`}
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
      </div>
    </div>
  );
}