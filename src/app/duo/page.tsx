// src/app/duo/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';
import { LoadingSpinner, EmptyState, CardSkeleton } from '@/components/LoadingStates';
import { Button } from '@/components/ui/button';
import { Clock, User, Play, Users, Crown, Shield, Star, Link, ChevronDown, Settings } from 'lucide-react';
import { useQueue, useLocalStorage } from '@/hooks';
import { GAMES } from '@/lib/games';
import { calculateBundleDiscount, formatCurrency, getRankColor } from '@/lib/utils';

// Duo service options for each game
const DUO_OPTIONS = {
  valorant: [
    { id: 'duo', name: 'Duo', description: 'Standard duo queue' },
    { id: 'premium', name: 'Premium Duo', description: 'Premium coaching & analysis' },
    { id: 'casual', name: 'Spike Rush & LTMs', description: 'Casual game modes' }
  ],
  league: [
    { id: 'duo', name: 'Duo', description: 'Ranked duo queue' },
    { id: 'premium', name: 'Premium Duo', description: 'Premium coaching & analysis' },
    { id: 'aram', name: 'ARAM & LTMs', description: 'ARAM and limited time modes' }
  ],
  csgo: [
    { id: 'duo', name: 'Duo', description: 'Competitive matchmaking' },
    { id: 'premium', name: 'Premium Duo', description: 'Premium coaching & analysis' },
    { id: 'casual', name: 'Casual & Retakes', description: 'Casual and community modes' }
  ]
};

// Base pricing that gets modified by rank
const BASE_PRICING = {
  valorant: {
    duo: 12,
    premium: 18,
    casual: 8
  },
  league: {
    duo: 15,
    premium: 22,
    casual: 10
  },
  csgo: {
    duo: 10,
    premium: 16,
    casual: 7
  }
};

// Rank multipliers for pricing
const RANK_MULTIPLIERS = {
  // Lower ranks get discounts
  'Iron': 0.7,
  'Bronze': 0.8,
  'Silver': 0.9,
  'Gold': 1.0,
  'Platinum': 1.1,
  'Diamond': 1.2,
  'Master': 1.3,
  'Grandmaster': 1.4,
  'Challenger': 1.5,
  'Immortal': 1.3,
  'Radiant': 1.5,
  'Ascendant': 1.1,
  'Supreme': 1.3,
  'Global Elite': 1.4,
  'Legendary Eagle': 1.2
};

// Account interface types
interface ValorantAccount {
  id: string;
  username: string;
  rank: string;
  rr: number;
  isMain: boolean;
  game: 'valorant';
}

interface LeagueAccount {
  id: string;
  username: string;
  rank: string;
  lp: number;
  isMain: boolean;
  game: 'league';
}

interface CSGOAccount {
  id: string;
  username: string;
  rank: string;
  elo: number;
  isMain: boolean;
  game: 'csgo';
}

type GameAccount = ValorantAccount | LeagueAccount | CSGOAccount;

// Mock connected accounts
const MOCK_ACCOUNTS = {
  valorant: [
    { id: '1', username: 'PlayerPro#123', rank: 'Diamond 3', rr: 67, isMain: true, game: 'valorant' as const },
    { id: '2', username: 'AltAccount#456', rank: 'Gold 2', rr: 45, isMain: false, game: 'valorant' as const }
  ],
  league: [
    { id: '3', username: 'SummonerName', rank: 'Platinum 1', lp: 78, isMain: true, game: 'league' as const },
    { id: '4', username: 'SmurfAcc', rank: 'Silver 3', lp: 23, isMain: false, game: 'league' as const }
  ],
  csgo: [
    { id: '5', username: 'CSGOPlayer', rank: 'Legendary Eagle', elo: 1850, isMain: true, game: 'csgo' as const }
  ]
};

// Enhanced mock players with more League players
const MOCK_PLAYERS = [
  // Valorant Players
  {
    id: '1',
    name: 'CapyChill',
    rank: 'Diamond 3',
    winRate: '67%',
    rating: 4.8,
    totalSessions: 142,
    mainRole: 'Duelist',
    secondaryRole: 'Initiator',
    online: true,
    lastOnline: 'Online now',
    game: 'valorant',
    verified: true,
    image: '/images/avatars/capy1.jpg'
  },
  {
    id: '2',
    name: 'CapyZen',
    rank: 'Immortal 1',
    winRate: '72%',
    rating: 4.9,
    totalSessions: 203,
    mainRole: 'Controller',
    secondaryRole: 'Sentinel',
    online: true,
    lastOnline: 'Online now',
    game: 'valorant',
    verified: true,
    image: '/images/avatars/capy2.jpg'
  },
  {
    id: '3',
    name: 'CapyNap',
    rank: 'Ascendant 2',
    winRate: '61%',
    rating: 4.3,
    totalSessions: 89,
    mainRole: 'Initiator',
    secondaryRole: 'Duelist',
    online: false,
    lastOnline: '3 hours ago',
    game: 'valorant',
    image: '/images/avatars/capy3.jpg'
  },
  {
    id: '4',
    name: 'CapyKing',
    rank: 'Radiant',
    winRate: '80%',
    rating: 5.0,
    totalSessions: 378,
    mainRole: 'Sentinel',
    secondaryRole: 'Controller',
    online: true,
    lastOnline: 'Online now',
    game: 'valorant',
    verified: true,
    image: '/images/avatars/capy4.jpg'
  },
  // League of Legends Players (Added more)
  {
    id: '5',
    name: 'CapyLeaf',
    rank: 'Master',
    winRate: '75%',
    rating: 4.7,
    totalSessions: 156,
    mainRole: 'Jungle',
    secondaryRole: 'Top',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    verified: true,
    image: '/images/avatars/capy5.jpg'
  },
  {
    id: '6',
    name: 'CapyStorm',
    rank: 'Grandmaster',
    winRate: '78%',
    rating: 4.9,
    totalSessions: 289,
    mainRole: 'Mid',
    secondaryRole: 'Support',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    verified: true,
    image: '/images/avatars/capy6.jpg'
  },
  {
    id: '7',
    name: 'CapyBot',
    rank: 'Diamond 1',
    winRate: '69%',
    rating: 4.5,
    totalSessions: 134,
    mainRole: 'Bot',
    secondaryRole: 'Mid',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    image: '/images/avatars/capy7.jpg'
  },
  {
    id: '8',
    name: 'CapySupport',
    rank: 'Challenger',
    winRate: '82%',
    rating: 5.0,
    totalSessions: 421,
    mainRole: 'Support',
    secondaryRole: 'Jungle',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    verified: true,
    image: '/images/avatars/capy8.jpg'
  },
  {
    id: '9',
    name: 'CapyTop',
    rank: 'Master',
    winRate: '71%',
    rating: 4.6,
    totalSessions: 187,
    mainRole: 'Top',
    secondaryRole: 'Jungle',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    image: '/images/avatars/capy9.jpg'
  },
  {
    id: '15',
    name: 'CapyAdc',
    rank: 'Diamond 2',
    winRate: '74%',
    rating: 4.6,
    totalSessions: 198,
    mainRole: 'Bot',
    secondaryRole: 'Mid',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    image: '/images/avatars/capy15.jpg'
  },
  {
    id: '16',
    name: 'CapyMid',
    rank: 'Platinum 1',
    winRate: '68%',
    rating: 4.3,
    totalSessions: 156,
    mainRole: 'Mid',
    secondaryRole: 'Support',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    image: '/images/avatars/capy16.jpg'
  },
  {
    id: '17',
    name: 'CapyCarry',
    rank: 'Master',
    winRate: '77%',
    rating: 4.8,
    totalSessions: 234,
    mainRole: 'Bot',
    secondaryRole: 'Top',
    online: true,
    lastOnline: 'Online now',
    game: 'league',
    verified: true,
    image: '/images/avatars/capy17.jpg'
  },
  // CS:GO Players
  {
    id: '10',
    name: 'CapyAim',
    rank: 'Global Elite',
    winRate: '76%',
    rating: 4.8,
    totalSessions: 245,
    mainRole: 'AWPer',
    secondaryRole: 'Rifler',
    online: true,
    lastOnline: 'Online now',
    game: 'csgo',
    verified: true,
    image: '/images/avatars/capy10.jpg'
  },
  {
    id: '11',
    name: 'CapySpray',
    rank: 'Supreme',
    winRate: '73%',
    rating: 4.7,
    totalSessions: 198,
    mainRole: 'Entry Fragger',
    secondaryRole: 'Support',
    online: true,
    lastOnline: 'Online now',
    game: 'csgo',
    verified: true,
    image: '/images/avatars/capy11.jpg'
  },
  {
    id: '12',
    name: 'CapyFlash',
    rank: 'Legendary Eagle',
    winRate: '68%',
    rating: 4.4,
    totalSessions: 112,
    mainRole: 'IGL',
    secondaryRole: 'Support',
    online: false,
    lastOnline: '2 hours ago',
    game: 'csgo',
    image: '/images/avatars/capy12.jpg'
  },
  {
    id: '13',
    name: 'CapyClutch',
    rank: 'Global Elite',
    winRate: '79%',
    rating: 4.9,
    totalSessions: 334,
    mainRole: 'Lurker',
    secondaryRole: 'AWPer',
    online: true,
    lastOnline: 'Online now',
    game: 'csgo',
    verified: true,
    image: '/images/avatars/capy13.jpg'
  },
  {
    id: '14',
    name: 'CapySmoke',
    rank: 'Supreme',
    winRate: '70%',
    rating: 4.5,
    totalSessions: 167,
    mainRole: 'Support',
    secondaryRole: 'IGL',
    online: true,
    lastOnline: 'Online now',
    game: 'csgo',
    image: '/images/avatars/capy14.jpg'
  },
];

// Account Linking Component
function AccountLinking({ selectedGame, onAccountChange }: { 
  selectedGame: string;
  onAccountChange: (account: GameAccount) => void;
}) {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const accounts = MOCK_ACCOUNTS[selectedGame as keyof typeof MOCK_ACCOUNTS] || [];
  const mainAccount = accounts.find(acc => acc.isMain) || accounts[0];

  const handleLinkAccount = () => {
    // Simulate account linking
    alert(`Linking ${GAMES.find(g => g.id === selectedGame)?.name} account...`);
  };

  const getAccountScore = (account: GameAccount) => {
    switch (account.game) {
      case 'valorant':
        return `${account.rr} RR`;
      case 'league':
        return `${account.lp} LP`;
      case 'csgo':
        return `${account.elo} ELO`;
      default:
        return '';
    }
  };

  if (!mainAccount) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-[#e6915b]/30 p-4 mb-6">
        <div className="text-center">
          <Link className="text-[#e6915b] mb-2 mx-auto" size={24} />
          <h3 className="text-lg font-semibold text-[#e6915b] mb-2">Link Your Account</h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your {GAMES.find(g => g.id === selectedGame)?.name} account to get personalized pricing
          </p>
          <Button 
            onClick={handleLinkAccount}
            className="bg-[#e6915b] hover:bg-[#d18251] text-[#1a1a1a] font-medium px-6 py-2 rounded-lg"
          >
            <Link size={16} className="mr-2" />
            Link Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border-2 border-[#e6915b]/30 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#e6915b] rounded-full flex items-center justify-center">
            <User className="text-[#1a1a1a]" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#e6915b]">{mainAccount.username}</span>
              {mainAccount.isMain && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">MAIN</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${getRankColor(mainAccount.rank)}`}>
                {mainAccount.rank}
              </span>
              <span className="text-gray-400">
                • {getAccountScore(mainAccount)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <div className="relative">
              <Button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                variant="outline"
                size="sm"
                className="border-[#e6915b] text-[#e6915b] bg-transparent hover:bg-[#e6915b]/20 hover:border-[#e6915b] hover:text-[#e6915b]"
              >
                Switch <ChevronDown size={14} className="ml-1" />
              </Button>
              
              {showAccountDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-[#2a2a2a] border border-[#e6915b]/30 rounded-lg shadow-lg z-10 min-w-48">
                  {accounts.filter(acc => !acc.isMain).map(account => (
                    <button
                      key={account.id}
                      onClick={() => {
                        onAccountChange(account);
                        setShowAccountDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#e6915b]/10 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium text-[#e6915b]">{account.username}</div>
                      <div className="text-sm text-gray-400">{account.rank}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Button
            onClick={handleLinkAccount}
            variant="outline"
            size="sm"
            className="border-[#e6915b] text-[#e6915b] bg-transparent hover:bg-[#e6915b]/20 hover:border-[#e6915b] hover:text-[#e6915b]"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Player Card Component
function PlayerCard({ player, onJoinQueue, isLoading }: {
  player: typeof MOCK_PLAYERS[0];
  onJoinQueue: (id: string) => void;
  isLoading: boolean;
}) {
  const isHighRank = player.rank.includes('Radiant') || 
                   player.rank.includes('Grandmaster') || 
                   player.rank.includes('Challenger') ||
                   player.rank.includes('Global Elite');

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star 
            key={`full-${i}`} 
            size={14} 
            className="text-yellow-400 fill-current" 
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div key="half" className="relative">
            <Star size={14} className="text-gray-600" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={14} className="text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star 
            key={`empty-${i}`} 
            size={14} 
            className="text-gray-600" 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 hover:border-[#e6915b]/70 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg relative">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="bg-[#2a2a2a] w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-[#e6915b] border-2 border-[#e6915b]/30 overflow-hidden">
              {player.image ? (
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                player.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a1a1a] ${
              player.online ? "bg-green-500" : "bg-gray-400"
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg flex items-center text-[#e6915b] mb-1">
              {player.name}
              {player.verified && <Shield className="ml-2 text-blue-400" size={16} />}
              {isHighRank && <Crown className="ml-2 text-yellow-400" size={16} />}
            </h3>
            
            <div className="flex items-center text-sm mb-2">
              <span className={`font-medium ${getRankColor(player.rank)}`}>
                {player.rank}
              </span>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-green-500">
                {player.winRate} WR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {renderStars(player.rating)}
              <span className="text-sm text-gray-400">
                {player.rating.toFixed(1)} ({player.totalSessions} sessions)
              </span>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              {player.online ? 'Online now' : `Last seen: ${player.lastOnline}`}
            </div>
          </div>
        </div>
        
        {/* Roles */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-16 flex-shrink-0">Main:</span>
            <span className="font-medium text-[#e6915b] bg-[#e6915b]/10 px-2 py-1 rounded text-xs">
              {player.mainRole}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-400 w-16 flex-shrink-0">Alt:</span>
            <span className="font-medium text-[#6b8ab0] bg-[#6b8ab0]/10 px-2 py-1 rounded text-xs">
              {player.secondaryRole}
            </span>
          </div>
        </div>
        
        {/* Queue Action - Only show for online players */}
        {player.online && (
          <Button 
            onClick={() => onJoinQueue(player.id)}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              <>
                <Users size={16} />
                Queue with {player.name.split('Capy')[1]}
              </>
            )}
          </Button>
        )}
        
        {/* Offline overlay */}
        {!player.online && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
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
  const [selectedDuoOption, setSelectedDuoOption] = useLocalStorage('duo-option', 'duo');
  const [bundleSize, setBundleSize] = useLocalStorage('duo-bundle-size', 1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<GameAccount | null>(null);
  const [matchedTeammate, setMatchedTeammate] = useState<typeof MOCK_PLAYERS[0] | null>(null);
  const [showTeammateAcceptance, setShowTeammateAcceptance] = useState(false);
  const [userAccepted, setUserAccepted] = useState(false);
  const [teammateAccepted, setTeammateAccepted] = useState(false);
  
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
    onMatchFound: () => {
      // Simulate finding a random teammate
      const availablePlayers = MOCK_PLAYERS.filter(p => 
        p.game === selectedGame && p.online
      );
      const randomTeammate = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      setMatchedTeammate(randomTeammate);
      setShowTeammateAcceptance(true);
      
      // Reset acceptance states for new match
      setUserAccepted(false);
      setTeammateAccepted(false);
    },
    minMatchTime: 8000,
    maxMatchTime: 15000
  });

  // Get current account or default
  const activeAccount = currentAccount || (MOCK_ACCOUNTS[selectedGame as keyof typeof MOCK_ACCOUNTS] || [])[0];

  // Calculate pricing based on rank
  const calculatePrice = useCallback((basePrice: number) => {
    if (!activeAccount) return basePrice;
    
    const rankKey = Object.keys(RANK_MULTIPLIERS).find(rank => 
      activeAccount.rank.includes(rank)
    );
    const multiplier = rankKey ? RANK_MULTIPLIERS[rankKey as keyof typeof RANK_MULTIPLIERS] : 1.0;
    
    return Math.round(basePrice * multiplier);
  }, [activeAccount]);

  // Get current game pricing
  const currentGamePricing = BASE_PRICING[selectedGame as keyof typeof BASE_PRICING] || BASE_PRICING.valorant;
  const currentPrice = calculatePrice(currentGamePricing[selectedDuoOption as keyof typeof currentGamePricing] || currentGamePricing.duo);

  // Filter players by selected game - online players are considered "in queue"
  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter(p => 
      p.game === selectedGame && (p.online || !isInQueue)
    );
  }, [selectedGame, isInQueue]);

  // Get online players count (these are considered in queue)
  const onlinePlayersCount = useMemo(() => {
    return MOCK_PLAYERS.filter(p => p.online && p.game === selectedGame).length;
  }, [selectedGame]);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculateBundleDiscount(bundleSize, currentPrice);
  }, [bundleSize, currentPrice]);

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

  // Handle teammate acceptance
  const handleAcceptTeammate = useCallback(() => {
    // Simulate teammate acceptance after delay
    setUserAccepted(true);
    setTimeout(() => {
      setTeammateAccepted(true);
    }, 3000); // 3 seconds for simulation
  }, []);

  // Handle keep looking
  const handleKeepLooking = useCallback(() => {
    console.log('Keep looking for teammates...');
    setMatchedTeammate(null);
    setShowTeammateAcceptance(false);
    // Reset queue to continue searching
    resetQueue();
    // Rejoin queue automatically
    setTimeout(() => {
      joinQueue();
    }, 500);
  }, [resetQueue, joinQueue]);

  // Handle player queue join
  const handleJoinPlayerQueue = useCallback(async (playerId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Joined queue with player:', playerId);
      joinQueue();
    } catch (error) {
      console.error('Failed to join player queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, [joinQueue]);

  const duoOptions = DUO_OPTIONS[selectedGame as keyof typeof DUO_OPTIONS] || DUO_OPTIONS.valorant;

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
        
        {/* Account Linking */}
        <AccountLinking 
          selectedGame={selectedGame}
          onAccountChange={(account: GameAccount) => setCurrentAccount(account)}
        />

        {/* Duo Options */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-[#e6915b]">Choose Your Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {duoOptions.map((option) => {
              const optionPrice = calculatePrice(currentGamePricing[option.id as keyof typeof currentGamePricing] || currentGamePricing.duo);
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedDuoOption(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedDuoOption === option.id
                      ? 'border-[#e6915b] bg-[#e6915b]/10'
                      : 'border-[#e6915b]/30 hover:border-[#e6915b]/50'
                  }`}
                >
                  <h4 className="font-semibold text-[#e6915b] mb-2">{option.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{option.description}</p>
                  <div className="text-lg font-bold text-[#e6915b]">
                    ${optionPrice}/game
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Compact Queue System */}
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border-2 border-[#e6915b]/30 shadow-lg mb-10">
          <div className="p-4 bg-gradient-to-r from-[#e6915b] to-[#d18251]">
            <h2 className="text-xl font-bold flex items-center justify-center text-[#1a1a1a]">
              <Play className="mr-2" size={20} />
              Queue Now!
            </h2>
          </div>
          
          <div className="p-4">
            {!isInQueue ? (
              <div>
                {/* Bundle Size Selector */}
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-3 text-center text-[#e6915b]">
                    How many games?
                  </h3>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleBundleSizeChange(-1)}
                      disabled={bundleSize <= 1}
                      className="w-10 h-10 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    
                    <div className="text-2xl font-bold bg-[#2a2a2a] px-6 py-2 rounded-xl border-2 border-[#e6915b]/30 text-[#e6915b]">
                      {bundleSize}
                    </div>
                    
                    <button
                      onClick={() => handleBundleSizeChange(1)}
                      disabled={bundleSize >= 10}
                      className="w-10 h-10 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Pricing Summary */}
                <div className="bg-[#2a2a2a] rounded-lg p-3 mb-4 border border-[#e6915b]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[#e6915b]">
                      {bundleSize} × ${currentPrice}/game
                    </span>
                    <span className="text-[#e6915b] font-bold text-xl">
                      {formatCurrency(pricing.totalPrice)}
                    </span>
                  </div>
                  {pricing.discountPercent > 0 && (
                    <div className="text-sm text-green-400 mt-1">
                      Save {pricing.discountPercent}%!
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleJoinQueue}
                  disabled={isLoading || onlinePlayersCount === 0}
                  className="w-full bg-[#e6915b] hover:bg-[#d18251] py-3 text-lg font-bold text-[#1a1a1a] shadow-lg hover:shadow-[#e6915b]/40 transition-all rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size={18} />
                      Joining...
                    </>
                  ) : onlinePlayersCount === 0 ? (
                    <>
                      <Clock size={18} />
                      No Players Available
                    </>
                  ) : (
                    <>
                      <Users size={18} />
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
                    <div className="mb-4">
                      <div className="w-12 h-12 border-4 border-[#e6915b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <h3 className="text-lg font-bold text-[#e6915b] mb-1">
                        {searching ? 'Finding teammates...' : 'In Queue'}
                      </h3>
                      <p className="text-[#e6915b]/80 mb-2">
                        Queue time: {Math.floor(queueTime / 1000)}s
                      </p>
                      <p className="text-sm text-gray-400">
                        {onlinePlayersCount} players available
                      </p>
                    </div>
                    
                    <Button 
                      onClick={leaveQueue}
                      variant="outline"
                      className="border-red-400 text-red-400 bg-transparent hover:bg-red-400/20 hover:border-red-300 hover:text-red-300 rounded-xl px-4 py-2 transition-all"
                    >
                      Leave Queue
                    </Button>
                  </div>
                ) : (
                  /* Match Found */
                  <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-4">
                    <div className="text-green-400 text-3xl mb-3">🎉</div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">Match Found!</h3>
                    <p className="text-green-300 mb-4">
                      We found you a teammate! Get ready to play.
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={resetQueue}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2"
                      >
                        <Play className="mr-2" size={14} />
                        Start Game
                      </Button>
                      <Button 
                        onClick={resetQueue}
                        variant="outline"
                        className="border-gray-500 text-gray-400 hover:bg-gray-600 hover:text-white rounded-xl px-4 py-2"
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
              {onlinePlayersCount} online
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