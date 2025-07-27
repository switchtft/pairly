'use client';

import { useState, useEffect } from 'react';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';
import { Button } from '@/components/ui/button';

type Player = {
  id: string;
  name: string;
  rank: string;
  winRate: string;
  mainRole: string;
  secondaryRole: string;
  online: boolean;
  lastOnline: string; // e.g., "2 hours ago"
  personalPrice: string;
  inQueue: boolean;
  queuePrice: string;
};

export default function DuoPage() {
  const [selectedGame, setSelectedGame] = useState<string>('valorant');
  const [bundleSize, setBundleSize] = useState<number>(1);
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [queueTime, setQueueTime] = useState<number>(0);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  
  // Mock player data
  const players: Player[] = [
    {
      id: '1',
      name: 'RadiantPhoenix',
      rank: 'Diamond 3',
      winRate: '67%',
      mainRole: 'Duelist',
      secondaryRole: 'Initiator',
      online: true,
      lastOnline: 'Online now',
      personalPrice: '$15/hr',
      inQueue: true,
      queuePrice: '$10/hr'
    },
    {
      id: '2',
      name: 'ShadowStrike',
      rank: 'Immortal 1',
      winRate: '72%',
      mainRole: 'Controller',
      secondaryRole: 'Sentinel',
      online: true,
      lastOnline: 'Online now',
      personalPrice: '$18/hr',
      inQueue: true,
      queuePrice: '$10/hr'
    },
    {
      id: '3',
      name: 'NeonBlitz',
      rank: 'Ascendant 2',
      winRate: '61%',
      mainRole: 'Initiator',
      secondaryRole: 'Duelist',
      online: false,
      lastOnline: '3 hours ago',
      personalPrice: '$12/hr',
      inQueue: false,
      queuePrice: '$10/hr'
    },
    {
      id: '4',
      name: 'CypherMind',
      rank: 'Radiant',
      winRate: '80%',
      mainRole: 'Sentinel',
      secondaryRole: 'Controller',
      online: true,
      lastOnline: 'Online now',
      personalPrice: '$20/hr',
      inQueue: false,
      queuePrice: '$10/hr'
    },
  ];

  const games = [
    { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', imageUrl: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
  ];

  const filteredPlayers = players.filter(p => p.inQueue || !isInQueue);
  
  // Calculate total price based on bundle size
  const calculateTotal = () => {
    const basePrice = 10; // $10 per game
    return `$${(basePrice * bundleSize).toFixed(2)}`;
  };

  // Handle joining the queue
  const handleJoinQueue = () => {
    setShowPayment(true);
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    setIsInQueue(true);
    
    // Start queue timer
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);
    
    // Clear timer after 10 seconds for demo
    setTimeout(() => {
      clearInterval(timer);
    }, 10000);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent mb-4">
            Find Your Perfect Duo Partner
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect with skilled players who match your playstyle and ranking.
          </p>
        </div>
        
        {/* Game Selector */}
        <div className="mb-10">
          <HorizontalGameSelector 
            games={games}
            onGameSelect={setSelectedGame}
            selectedGameId={selectedGame}
          />
        </div>
        
        {/* Queue Section */}
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] mb-12">
          <div className="p-6 bg-[#2a2a2a]">
            <h2 className="text-2xl font-bold">Queue System</h2>
            <p className="text-gray-400 mt-2">
              Get matched with teammates at a discounted rate
            </p>
          </div>
          
          <div className="p-6">
            {!isInQueue ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Select Bundle Size</h3>
                  <div className="flex gap-3">
                    {[1, 3, 5].map(size => (
                      <button
                        key={size}
                        onClick={() => setBundleSize(size)}
                        className={`px-6 py-3 rounded-lg ${
                          bundleSize === size
                            ? 'bg-gradient-to-r from-[#6b8ab0] to-[#8a675e]'
                            : 'bg-[#2a2a2a] hover:bg-[#333]'
                        }`}
                      >
                        {size} Game{size > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Order Summary</h4>
                    <span className="text-[#e6915b] font-bold">{calculateTotal()}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {bundleSize} game{bundleSize > 1 ? 's' : ''} at $10/game
                  </p>
                </div>
                
                {!showPayment ? (
                  <Button 
                    onClick={handleJoinQueue}
                    className="w-full bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e] py-4 text-lg"
                  >
                    Join Queue
                  </Button>
                ) : (
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">Complete Payment</h4>
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 border border-[#333]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 border border-[#333]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">CVC</label>
                        <input 
                          type="text" 
                          placeholder="CVC" 
                          className="w-full bg-[#1a1a1a] rounded-lg px-4 py-3 border border-[#333]"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handlePaymentComplete}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-4 text-lg"
                    >
                      Pay {calculateTotal()}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#e6915b] mb-2">
                    {formatTime(queueTime)}
                  </div>
                  <p className="text-gray-400">Searching for teammates...</p>
                </div>
                
                <div className="mb-8">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-[#6b8ab0] h-2.5 rounded-full" 
                      style={{ width: `${Math.min(queueTime * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Players in Queue</h3>
                  <div className="flex justify-center gap-4">
                    {players.filter(p => p.inQueue).map(player => (
                      <div key={player.id} className="flex flex-col items-center">
                        <div className="bg-gray-700 w-16 h-16 rounded-full mb-2"></div>
                        <span className="text-sm">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsInQueue(false)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  Cancel Queue
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Available Teammates */}
        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
          <div className="p-6 bg-[#2a2a2a]">
            <h2 className="text-2xl font-bold flex items-center">
              Available Teammates
              <span className="ml-4 text-sm font-normal bg-[#e6915b] text-black px-3 py-1 rounded-full">
                {players.filter(p => p.online).length} Online Now
              </span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlayers.map(player => (
                <div 
                  key={player.id} 
                  className="bg-[#1f1f1f] rounded-lg border border-[#333] hover:border-[#e6915b] transition-all"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl flex items-center">
                          {player.name}
                          {player.online ? (
                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                          ) : (
                            <span className="ml-2 w-2 h-2 bg-gray-500 rounded-full"></span>
                          )}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-[#e6915b] font-medium">{player.rank}</span>
                          <span className="mx-2 text-gray-600">|</span>
                          <span className="text-green-500">{player.winRate} WR</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {player.online ? 'Online now' : `Last online: ${player.lastOnline}`}
                        </div>
                      </div>
                      <div className="bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center text-xl">
                        {player.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <div className="flex items-center text-sm mb-2">
                        <span className="text-gray-500 w-24">Main Role:</span>
                        <span className="font-medium">{player.mainRole}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Secondary:</span>
                        <span className="font-medium">{player.secondaryRole}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold">
                        {player.inQueue ? player.queuePrice : player.personalPrice}
                        <span className="text-sm font-normal ml-1 text-gray-500">/hr</span>
                        {player.inQueue && (
                          <div className="text-xs text-green-500">Queue Discount</div>
                        )}
                      </div>
                      
                      <Button className="bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e]">
                        {player.inQueue ? 'Join Queue' : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}