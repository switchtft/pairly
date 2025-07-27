'use client';

import { useState, useEffect, useCallback } from 'react';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, User, Crown, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Player = {
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
};

export default function DuoPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string>('valorant');
  const [bundleSize, setBundleSize] = useState<number>(1);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [queueTime, setQueueTime] = useState<number>(0);
  const [matchFound, setMatchFound] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  
  // Mock player data
  const players: Player[] = [
    {
      id: '1',
      name: 'CapyChill',
      rank: 'Diamond 3',
      winRate: '67%',
      mainRole: 'Duelist',
      secondaryRole: 'Initiator',
      online: true,
      lastOnline: 'Online now',
      personalPrice: '$15/hr',
      inQueue: true,
      queuePrice: '$10/hr',
      game: 'valorant'
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
      personalPrice: '$18/hr',
      inQueue: true,
      queuePrice: '$10/hr',
      game: 'valorant'
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
      personalPrice: '$12/hr',
      inQueue: false,
      queuePrice: '$10/hr',
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
      personalPrice: '$20/hr',
      inQueue: false,
      queuePrice: '$10/hr',
      game: 'valorant'
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
      personalPrice: '$16/hr',
      inQueue: true,
      queuePrice: '$12/hr',
      game: 'league'
    },
  ];

  const games = [
    { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', imageUrl: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
  ];

  // Filter players by selected game and queue status
  const filteredPlayers = useCallback(() => {
    return players.filter(p => 
      p.game === selectedGame && (p.inQueue || !isInQueue)
    );
  }, [selectedGame, isInQueue]);

  // Calculate total price based on bundle size
  const calculateTotal = useCallback(() => {
    const basePrice = 10; // $10 per game
    return `$${(basePrice * bundleSize).toFixed(2)}`;
  }, [bundleSize]);

  // Handle joining the queue
  const handleJoinQueue = () => {
    setSearching(true);
    setIsInQueue(true);
    
    // Start queue timer
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);
    
    // Simulate match found after 8-15 seconds
    const matchTime = 8000 + Math.random() * 7000;
    setTimeout(() => {
      setMatchFound(true);
      setSearching(false);
      clearInterval(timer);
    }, matchTime);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset queue
  const resetQueue = () => {
    setIsInQueue(false);
    setMatchFound(false);
    setQueueTime(0);
  };

  // Navigate to queue page
  const goToQueuePage = () => {
    router.push('/queue');
  };

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
            Connect with friendly players who match your playstyle
          </p>
        </div>
        
        {/* Game Selector */}
        <div className="mb-8 md:mb-12">
          <HorizontalGameSelector 
            games={games}
            onGameSelect={setSelectedGame}
            selectedGameId={selectedGame}
          />
        </div>
        
        {/* Queue Section */}
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
                <div className="mb-6">
                  <h3 className="text-md sm:text-lg font-semibold mb-3 text-center text-[#e6915b]">
                    How many games do you want to play?
                  </h3>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setBundleSize(prev => Math.max(1, prev - 1))}
                      className="w-12 h-12 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-2xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50"
                    >
                      -
                    </button>
                    
                    <div className="text-3xl font-bold bg-[#2a2a2a] px-8 py-3 rounded-xl border-2 border-[#e6915b]/30 text-[#e6915b]">
                      {bundleSize} Game{bundleSize > 1 ? 's' : ''}
                    </div>
                    
                    <button
                      onClick={() => setBundleSize(prev => Math.min(10, prev + 1))}
                      className="w-12 h-12 rounded-full bg-[#2a2a2a] text-[#e6915b] flex items-center justify-center text-2xl hover:bg-[#e6915b] hover:text-[#1a1a1a] transition-all border-2 border-[#e6915b]/50"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-xl p-4 sm:p-5 mb-6 border-2 border-[#e6915b]/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md sm:text-lg font-semibold text-[#e6915b]">Order Summary</h4>
                    <span className="text-[#e6915b] font-bold text-2xl">{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-[#e6915b]/80 text-sm">
                    <span>{bundleSize} game{bundleSize > 1 ? 's' : ''} × $10/game</span>
                    <span className="text-[#e6915b] font-medium">Save {bundleSize > 1 ? (bundleSize * 2) : 0}%</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleJoinQueue}
                  className="w-full bg-[#e6915b] hover:bg-[#d18251] py-4 text-lg font-bold text-[#1a1a1a] shadow-lg hover:shadow-[#e6915b]/40 transition-all rounded-xl"
                >
                  Join Queue
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                {searching ? (
                  <>
                    <div className="mb-6">
                      <div className="text-3xl sm:text-4xl font-bold text-[#e6915b] mb-2 flex justify-center items-center">
                        <Loader2 className="animate-spin mr-3" size={32} />
                        {formatTime(queueTime)}
                      </div>
                      <p className="text-[#e6915b]/80 text-base">Searching for the perfect teammates...</p>
                    </div>
                    
                    <div className="mb-8 max-w-md mx-auto">
                      <div className="w-full bg-[#2a2a2a] rounded-full h-3 mb-3">
                        <div 
                          className="bg-[#e6915b] h-3 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(queueTime * 5, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[#e6915b]/80 text-sm">
                        <span>Estimated: 1-3 min</span>
                        <span>{Math.min(queueTime * 5, 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <div className="relative w-40 h-24">
                        <div className="absolute w-16 h-10 bg-[#e6915b] rounded-full top-4 left-0 animate-bounce-slow"></div>
                        <div className="absolute w-16 h-10 bg-[#e6915b] rounded-full top-8 left-8 animate-bounce-slow animation-delay-200"></div>
                        <div className="absolute w-16 h-10 bg-[#e6915b] rounded-full top-4 left-16 animate-bounce-slow animation-delay-400"></div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={resetQueue}
                      className="bg-[#2a2a2a] hover:bg-[#e6915b] text-[#e6915b] hover:text-[#1a1a1a] border-2 border-[#e6915b]/50 rounded-xl py-3 px-6 font-medium"
                    >
                      Cancel Queue
                    </Button>
                  </>
                ) : matchFound ? (
                  <div className="bg-[#2a2a2a] rounded-2xl p-6 sm:p-8 border-2 border-[#e6915b] shadow-lg max-w-lg mx-auto">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-20 h-12 bg-[#e6915b] rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-[#5a3d2b] rounded-full mr-1"></div>
                          <div className="w-4 h-4 bg-[#5a3d2b] rounded-full"></div>
                        </div>
                        <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                          <div className="w-8 h-8 bg-[#e6915b] rounded-full flex items-center justify-center">
                            <Play size={16} className="text-[#1a1a1a]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#e6915b] mb-2">Match Found!</h3>
                    <p className="text-[#e6915b]/80 mb-6">
                      We've found the perfect teammates for your next {bundleSize} game{bundleSize > 1 ? 's' : ''}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={goToQueuePage}
                        className="bg-[#e6915b] hover:bg-[#d18251] text-[#1a1a1a] rounded-xl py-3 px-6 font-bold"
                      >
                        Go to Queue Page
                      </Button>
                      <Button 
                        onClick={resetQueue}
                        className="bg-[#2a2a2a] hover:bg-[#e6915b] text-[#e6915b] hover:text-[#1a1a1a] border-2 border-[#e6915b]/50 rounded-xl py-3 px-6 font-medium"
                      >
                        Find Different Team
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        
        {/* Available Teammates */}
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border-2 border-[#e6915b]/30 shadow-lg">
          <div className="p-5 sm:p-6 bg-[#e6915b]">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center text-[#1a1a1a]">
              <User className="mr-2" size={24} />
              Available Teammates
              <span className="ml-4 text-sm font-medium bg-[#1a1a1a] text-[#e6915b] px-3 py-1 rounded-full">
                {players.filter(p => p.online && p.game === selectedGame).length} Online Now
              </span>
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {filteredPlayers().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredPlayers().map(player => (
                  <div 
                    key={player.id} 
                    className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 hover:border-[#e6915b]/70 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg flex items-center text-[#e6915b]">
                            {player.name}
                            {player.online ? (
                              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                            ) : (
                              <span className="ml-2 w-2 h-2 bg-gray-400 rounded-full"></span>
                            )}
                            {player.rank.includes('Radiant') || player.rank.includes('Grandmaster') ? (
                              <Crown className="ml-2 text-[#e6915b]" size={16} />
                            ) : null}
                          </h3>
                          <div className="flex items-center mt-1 text-sm">
                            <span className="text-[#e6915b] font-medium">{player.rank}</span>
                            <span className="mx-2 text-gray-600">|</span>
                            <span className="text-green-500">{player.winRate} WR</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {player.online ? 'Online now' : `Last online: ${player.lastOnline}`}
                          </div>
                        </div>
                        <div className="bg-[#2a2a2a] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-[#e6915b] border-2 border-[#e6915b]/30">
                          {player.name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center text-sm mb-2">
                          <span className="text-gray-400 w-20">Main Role:</span>
                          <span className="font-medium text-[#e6915b]">{player.mainRole}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-400 w-20">Secondary:</span>
                          <span className="font-medium text-[#e6915b]">{player.secondaryRole}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-[#e6915b]">
                            {player.inQueue ? player.queuePrice : player.personalPrice}
                            <span className="text-sm font-normal ml-1 text-gray-500">/hr</span>
                          </div>
                          {player.inQueue && (
                            <div className="text-xs text-green-500 flex items-center">
                              <span className="bg-green-900/30 px-1.5 py-0.5 rounded">Queue Discount</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className={`py-2 px-4 text-sm bg-[#e6915b] hover:bg-[#d18251] text-[#1a1a1a] rounded-xl`}
                        >
                          {player.inQueue ? 'Join Queue' : 'Book Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-[#2a2a2a] rounded-2xl p-8 max-w-md mx-auto border-2 border-[#e6915b]/30">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-10 bg-[#e6915b] rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#e6915b]">No Players Available</h3>
                  <p className="text-[#e6915b]/80 mb-6">
                    There are currently no players available for {games.find(g => g.id === selectedGame)?.name}.
                    Check back later or try another game.
                  </p>
                  <Button 
                    onClick={() => setSelectedGame(games.find(g => g.id !== selectedGame)?.id || 'valorant')}
                    className="bg-[#e6915b] hover:bg-[#d18251] text-[#1a1a1a] rounded-xl py-2 px-6"
                  >
                    Switch Game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Capybara footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex">
          <div className="w-8 h-4 bg-[#e6915b] rounded-full mx-1"></div>
          <div className="w-8 h-4 bg-[#e6915b] rounded-full mx-1"></div>
          <div className="w-8 h-4 bg-[#e6915b] rounded-full mx-1"></div>
        </div>
        <p className="text-[#e6915b]/70 mt-2 text-sm">Made with ♥ for gamers and capybaras</p>
      </div>
    </div>
  );
}