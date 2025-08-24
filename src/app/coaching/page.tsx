'use client';

import { useState } from 'react';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';
import { Button } from '@/components/ui/button';

type Coach = {
  id: string;
  name: string;
  rank: string;
  rating: number;
  sessions: number;
  specialties: string[];
  hourlyRate: string;
  lastOnline: string;
};

export default function CoachingPage() {
  const [selectedGame, setSelectedGame] = useState<string>('league');
  
  const games = [
    { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', imageUrl: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
  ];

  // Mock coach data
  const coaches: Coach[] = [
    {
      id: '1',
      name: 'MasterYiPro',
      rank: 'Challenger',
      rating: 4.9,
      sessions: 142,
      specialties: ['Laning Phase', 'Jungle Pathing', 'Team Fighting'],
      hourlyRate: '$30',
      lastOnline: 'Online now'
    },
    {
      id: '2',
      name: 'MidlaneMentor',
      rank: 'Grandmaster',
      rating: 4.8,
      sessions: 87,
      specialties: ['Champion Pool', 'Map Awareness', 'Roaming'],
      hourlyRate: '$25',
      lastOnline: '1 hour ago'
    },
    {
      id: '3',
      name: 'SupportSensei',
      rank: 'Master',
      rating: 4.7,
      sessions: 65,
      specialties: ['Warding', 'Engage Timing', 'Peeling'],
      hourlyRate: '$22',
      lastOnline: 'Online now'
    },
    {
      id: '4',
      name: 'ADCProfessor',
      rank: 'Challenger',
      rating: 5.0,
      sessions: 203,
      specialties: ['Positioning', 'CS Practice', 'Kiting'],
      hourlyRate: '$35',
      lastOnline: '30 minutes ago'
    },
  ];

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="page-title md:text-5xl">
            Level Up Your Game with Expert Coaching
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn from the best players in your game.
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
        
        {/* Coaches List */}
        <div className="card-container">
          <div className="card-header">
            <h2 className="text-2xl font-bold flex items-center">
              Available Coaches
              <span className="ml-4 text-sm font-normal bg-primary text-white px-3 py-1 rounded-full">
                {coaches.length} Professionals Available
              </span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coaches.map(coach => (
                <div 
                  key={coach.id} 
                  className="bg-card-background rounded-lg border border-border-dark hover:border-primary transition-all"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{coach.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-primary font-medium">{coach.rank}</span>
                          <span className="mx-2 text-gray-600">|</span>
                          <span className="text-yellow-500">
                            {coach.rating.toFixed(1)} ★ ({coach.sessions} sessions)
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {coach.lastOnline}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {coach.hourlyRate}<span className="text-sm font-normal">/hour</span>
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <p className="text-gray-500 text-sm mb-2">Specializes in:</p>
                      <div className="flex flex-wrap gap-2">
                        {coach.specialties.map(specialty => (
                          <span 
                            key={specialty} 
                            className="bg-primary/20 px-3 py-1 rounded-full text-sm border border-primary text-primary"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 primary-button">
                        Book Session
                      </Button>
                      <Button variant="outline" className="flex-1 outline-button">
                        View Profile
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