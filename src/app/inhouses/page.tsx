'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';

type Inhouse = {
  id: string;
  name: string;
  game: string;
  status: 'waiting' | 'in-progress' | 'completed';
  players: number;
  maxPlayers: number;
  startTime: string;
  voiceChat: boolean;
};

export default function InhousesPage() {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  
  const games = [
    { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', imageUrl: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
  ];

  // Mock inhouse data
  const inhouses: Inhouse[] = [
    {
      id: '1',
      name: 'Casual Valorant Night',
      game: 'valorant',
      status: 'waiting',
      players: 8,
      maxPlayers: 10,
      startTime: '2024-01-15T20:00:00Z',
      voiceChat: true
    },
    {
      id: '2',
      name: 'League Ranked Practice',
      game: 'league',
      status: 'in-progress',
      players: 10,
      maxPlayers: 10,
      startTime: '2024-01-15T19:30:00Z',
      voiceChat: true
    },
    {
      id: '3',
      name: 'CS:GO Scrim Session',
      game: 'csgo',
      status: 'waiting',
      players: 6,
      maxPlayers: 10,
      startTime: '2024-01-15T21:00:00Z',
      voiceChat: false
    },
  ];

  const filteredInhouses = selectedGame === 'all' 
    ? inhouses 
    : inhouses.filter(inhouse => inhouse.game === selectedGame);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400 bg-yellow-400/10';
      case 'in-progress': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

    return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="page-title md:text-5xl">
            Free Inhouses
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join casual 5v5 custom games with voice chat. No pressure, just fun gaming with new friends!
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
        
        {/* Create New Inhouse */}
        <div className="mb-8">
          <Button className="primary-button px-6 py-3">
            Create New Inhouse
          </Button>
        </div>
        
        {/* Inhouses List */}
        <div className="card-container">
          <div className="card-header">
            <h2 className="text-2xl font-bold flex items-center">
              Available Inhouses
                              <span className="ml-4 text-sm font-normal bg-primary text-white px-3 py-1 rounded-full">
                {filteredInhouses.length} Active
              </span>
            </h2>
          </div>
          
          <div className="p-6">
            {filteredInhouses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-800 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No inhouses available</h3>
                <p className="text-gray-400">Create a new inhouse or try a different game!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredInhouses.map(inhouse => (
                   <div 
                     key={inhouse.id} 
                     className="bg-card-background rounded-lg border border-border-dark hover:border-primary transition-all"
                   >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{inhouse.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inhouse.status)}`}>
                              {inhouse.status.replace('-', ' ')}
                            </span>
                                                                                       {inhouse.voiceChat && (
                                <span className="ml-2 text-primary text-xs">🎤 Voice Chat</span>
                              )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Players</div>
                          <div className="text-lg font-bold">{inhouse.players}/{inhouse.maxPlayers}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">Start Time</div>
                        <div className="text-sm font-medium">{formatTime(inhouse.startTime)}</div>
                      </div>
                      
                                             <div className="flex space-x-3">
                         <Button className="flex-1 primary-button">
                           Join
                         </Button>
                                                  <Button variant="outline" className="flex-1 outline-button">
                           Details
                         </Button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
