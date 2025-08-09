'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Users, Crown, Shield, Star, Plus, X, DollarSign, Filter, Search, Award, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import React from 'react';

// Visual game selector with larger images (same as duo page)
function GameSelector({ selectedGame, onGameSelect }: {
  selectedGame: string;
  onGameSelect: (game: string) => void;
}) {
  const games = [
    { id: 'valorant', name: 'Valorant', image: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', image: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', image: '/images/games/csgo.jpg' },
  ];

  return (
    <div className="flex justify-center gap-8 mb-8">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game.id)}
          className={`flex flex-col items-center gap-4 transition-all ${
            selectedGame === game.id
              ? 'scale-105'
              : 'hover:scale-105'
          }`}
        >
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden">
            <Image
              src={game.image}
              alt={game.name}
              fill
              className="object-cover"
            />
            {selectedGame === game.id && (
              <div className="absolute inset-0 bg-[#e6915b]/20 border-2 border-[#e6915b] rounded-2xl" />
            )}
          </div>
          <span className={`font-medium text-base ${
            selectedGame === game.id ? 'text-[#e6915b]' : 'text-gray-400'
          }`}>
            {game.name}
          </span>
        </button>
      ))}
    </div>
  );
}

// Filter component
function FilterSection({ filters, onFilterChange }: {
  filters: {
    priceRange: string;
    rank: string;
    minRating: number;
    minSessions: number;
    sortBy: string;
    sortOrder: string;
    minPrice: number;
    maxPrice: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
}) {
  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'price', label: 'Price' },
  ];

  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/20 mb-8">
      <div className="flex items-center gap-6">
        {/* Filter Coaches Label */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#e6915b]" />
          <h3 className="text-[#e6915b] font-semibold text-lg">Filter Coaches</h3>
        </div>

        {/* Price Range Slider */}
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[#e6915b] text-sm font-medium">${filters.minPrice}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', parseInt(e.target.value))}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-orange z-10"
              style={{
                background: 'transparent'
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', parseInt(e.target.value))}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-orange z-20"
              style={{
                background: 'transparent'
              }}
            />
            <div className="w-full h-2 bg-[#1a1a1a] rounded-lg relative">
              <div 
                className="absolute h-2 bg-[#e6915b] rounded-lg"
                style={{
                  left: `${(filters.minPrice / 100) * 100}%`,
                  right: `${100 - (filters.maxPrice / 100) * 100}%`
                }}
              ></div>
            </div>
          </div>
          <span className="text-[#e6915b] text-sm font-medium">${filters.maxPrice}</span>
        </div>

        {/* Sort By Dropdowns */}
        <div className="flex items-center gap-2">
          <span className="text-[#e6915b]/80 text-sm font-medium">Sort By</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#e6915b]/30 text-[#e6915b] focus:border-[#e6915b] focus:outline-none appearance-none text-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e6915b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2rem'
            }}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#e6915b]/30 text-[#e6915b] focus:border-[#e6915b] focus:outline-none appearance-none text-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e6915b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2rem'
            }}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e6915b;
          cursor: pointer;
          border: 2px solid #1a1a1a;
          pointer-events: auto;
        }
        
        .slider-orange::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #e6915b;
          cursor: pointer;
          border: 2px solid #1a1a1a;
          pointer-events: auto;
        }
        
        .slider-orange::-webkit-slider-track {
          background: transparent;
          border-radius: 8px;
          pointer-events: none;
        }
        
        .slider-orange::-moz-range-track {
          background: transparent;
          border-radius: 8px;
          height: 8px;
          pointer-events: none;
        }
        
        .slider-orange::-webkit-slider-runnable-track {
          background: transparent;
          pointer-events: none;
        }
        
        .slider-orange::-moz-range-progress {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// Coach card component
function CoachCard({ coach }: { coach: Coach }) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />);
    }

    return stars;
  };

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 p-6 hover:border-[#e6915b]/50 transition-all">
      {/* Coach Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#e6915b] to-[#d17a4a] rounded-full flex items-center justify-center">
          <span className="text-[#1a1a1a] font-bold text-xl">
            {coach.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#e6915b] text-lg">{coach.name}</h3>
            {coach.verified && (
              <Shield className="w-4 h-4 text-[#e6915b]" />
            )}
          </div>
          <p className="text-[#e6915b]/60 text-sm">{coach.rank}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#e6915b]">{coach.hourlyRate}</div>
          <div className="text-[#e6915b]/60 text-sm">per hour</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[#e6915b]/60 text-sm">Rating</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {renderStars(coach.rating)}
            </div>
            <span className="text-[#e6915b] font-semibold">{coach.rating.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <p className="text-[#e6915b]/60 text-sm">Sessions</p>
          <p className="text-[#e6915b] font-semibold">{coach.sessions}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <p className="text-[#e6915b]/60 text-sm mb-2">Specializes in:</p>
        <div className="flex flex-wrap gap-2">
          {coach.specialties.slice(0, 3).map((specialty: string) => (
            <span 
              key={specialty} 
              className="bg-[#e6915b]/10 text-[#e6915b] px-2 py-1 rounded text-xs border border-[#e6915b]/20"
            >
              {specialty}
            </span>
          ))}
          {coach.specialties.length > 3 && (
            <span className="text-[#e6915b]/60 text-xs">+{coach.specialties.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${coach.online ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-[#e6915b]/60 text-sm">{coach.lastOnline}</span>
        </div>
        <Button className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-4">
          Book Session
        </Button>
      </div>
    </div>
  );
}

type Coach = {
  id: string;
  name: string;
  rank: string;
  rating: number;
  sessions: number;
  specialties: string[];
  hourlyRate: string;
  lastOnline: string;
  online: boolean;
  verified: boolean;
  game: string;
};

export default function CoachingPage() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState('league');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rank: 'all',
    minRating: 0,
    minSessions: 0,
    sortBy: 'rating',
    sortOrder: 'desc',
    minPrice: 0,
    maxPrice: 100,
  });

  // Mock coach data
  const coaches: Coach[] = [
    {
      id: '1',
      name: 'MasterYiPro',
      rank: 'Challenger',
      rating: 4.9,
      sessions: 142,
      specialties: ['Laning Phase', 'Jungle Pathing', 'Team Fighting', 'Map Control'],
      hourlyRate: '$30',
      lastOnline: 'Online now',
      online: true,
      verified: true,
      game: 'league'
    },
    {
      id: '2',
      name: 'MidlaneMentor',
      rank: 'Grandmaster',
      rating: 4.8,
      sessions: 87,
      specialties: ['Champion Pool', 'Map Awareness', 'Roaming', 'Wave Management'],
      hourlyRate: '$25',
      lastOnline: '1 hour ago',
      online: false,
      verified: true,
      game: 'league'
    },
    {
      id: '3',
      name: 'SupportSensei',
      rank: 'Master',
      rating: 4.7,
      sessions: 65,
      specialties: ['Warding', 'Engage Timing', 'Peeling', 'Vision Control'],
      hourlyRate: '$22',
      lastOnline: 'Online now',
      online: true,
      verified: false,
      game: 'league'
    },
    {
      id: '4',
      name: 'ADCProfessor',
      rank: 'Challenger',
      rating: 5.0,
      sessions: 203,
      specialties: ['Positioning', 'CS Practice', 'Kiting', 'Team Fighting'],
      hourlyRate: '$35',
      lastOnline: '30 minutes ago',
      online: true,
      verified: true,
      game: 'league'
    },
    {
      id: '5',
      name: 'ValorantVeteran',
      rank: 'Radiant',
      rating: 4.9,
      sessions: 156,
      specialties: ['Aim Training', 'Game Sense', 'Team Coordination', 'Map Knowledge'],
      hourlyRate: '$28',
      lastOnline: 'Online now',
      online: true,
      verified: true,
      game: 'valorant'
    },
    {
      id: '6',
      name: 'CSGOSage',
      rank: 'Global Elite',
      rating: 4.8,
      sessions: 98,
      specialties: ['Aim Practice', 'Game Sense', 'Team Tactics', 'Map Control'],
      hourlyRate: '$26',
      lastOnline: '2 hours ago',
      online: false,
      verified: true,
      game: 'csgo'
    },
  ];

  // Filter coaches based on selected game and filters
  const filteredCoaches = useMemo(() => {
    const filtered = coaches.filter(coach => {
      // Filter by game
      if (coach.game !== selectedGame) return false;

      // Filter by price range
      if (filters.minPrice > 0 || filters.maxPrice < 100) {
        const price = parseInt(coach.hourlyRate.replace('$', ''));
        if (price < filters.minPrice || (filters.maxPrice !== 100 && price > filters.maxPrice)) return false;
      }

      return true;
    });

    // Sort coaches
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (filters.sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'price':
          aValue = parseInt(a.hourlyRate.replace('$', ''));
          bValue = parseInt(b.hourlyRate.replace('$', ''));
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [coaches, selectedGame, filters]);

  const handleFilterChange = useCallback((key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const onlineCoachesCount = useMemo(() => {
    return filteredCoaches.filter(coach => coach.online).length;
  }, [filteredCoaches]);

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#e6915b] mb-3">
            Level Up Your Game with Expert Coaching
          </h1>
          <p className="text-[#e6915b]/80 max-w-2xl mx-auto text-lg">
            Learn from the best players in your game
          </p>
        </div>

        {/* Game Selector */}
        <GameSelector selectedGame={selectedGame} onGameSelect={setSelectedGame} />

        {/* Filter Section */}
        <FilterSection filters={filters} onFilterChange={handleFilterChange} />

        {/* Coaches Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6915b] mb-6 flex items-center gap-3">
            Available Coaches
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-lg">{onlineCoachesCount} Online</span>
            </div>
          </h2>
          
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No coaches available</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}