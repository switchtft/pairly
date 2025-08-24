// app/tournaments/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import HorizontalGameSelector from '@/components/HorizontalGameSelector';

type Tournament = {
  id: string;
  name: string;
  game: string;
  date: string;
  prize: number;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  region: string;
  entryFee: number;
};

const TOURNAMENTS: Tournament[] = [
  { id: '1', name: 'Summer Clash', game: 'league', date: '2023-08-15', prize: 10000, participants: 32, status: 'upcoming', region: 'North America', entryFee: 25 },
  { id: '2', name: 'Valorant Masters', game: 'valorant', date: '2023-08-22', prize: 15000, participants: 16, status: 'upcoming', region: 'Europe', entryFee: 20 },
  { id: '3', name: 'CS:GO Major', game: 'csgo', date: '2023-08-30', prize: 25000, participants: 24, status: 'upcoming', region: 'Global', entryFee: 30 },
  { id: '4', name: 'LoL Championship', game: 'league', date: '2023-09-05', prize: 50000, participants: 16, status: 'upcoming', region: 'Global', entryFee: 50 },
  { id: '5', name: 'Valorant Open', game: 'valorant', date: '2023-09-12', prize: 8000, participants: 32, status: 'upcoming', region: 'Asia', entryFee: 15 },
  { id: '6', name: 'CS:GO Challenger', game: 'csgo', date: '2023-09-20', prize: 12000, participants: 24, status: 'upcoming', region: 'North America', entryFee: 20 },
  { id: '7', name: 'Radiant Rush', game: 'valorant', date: '2023-08-10', prize: 5000, participants: 16, status: 'ongoing', region: 'Europe', entryFee: 10 },
  { id: '8', name: 'Dragon League', game: 'league', date: '2023-08-12', prize: 7500, participants: 24, status: 'ongoing', region: 'Asia', entryFee: 15 },
  { id: '9', name: 'Global Offensive', game: 'csgo', date: '2023-07-25', prize: 18000, participants: 32, status: 'completed', region: 'Global', entryFee: 25 },
  { id: '10', name: 'Summoner Showdown', game: 'league', date: '2023-07-30', prize: 22000, participants: 24, status: 'completed', region: 'North America', entryFee: 30 },
];

const GAMES = [
  { id: 'league', name: 'League of Legends', imageUrl: '/images/games/league.jpg' },
  { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
  { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
];

const REGIONS = ['All', 'North America', 'Europe', 'Asia', 'Global'];
const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

export default function TournamentsPage() {
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prizeFilter, setPrizeFilter] = useState<number | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter tournaments based on all criteria
  const filteredTournaments = TOURNAMENTS.filter(tournament => {
    // Game filter
    if (selectedGame !== 'all' && tournament.game !== selectedGame) return false;
    
    // Search filter
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Prize filter
    if (prizeFilter && tournament.prize < prizeFilter) return false;
    
    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const tournamentDate = new Date(tournament.date);
      if (tournamentDate < filterDate) return false;
    }
    
    // Region filter
    if (regionFilter !== 'All' && tournament.region !== regionFilter) return false;
    
    // Status filter
    if (statusFilter !== 'All') {
      const statusLower = statusFilter.toLowerCase();
      if (statusLower === 'upcoming' && tournament.status !== 'upcoming') return false;
      if (statusLower === 'ongoing' && tournament.status !== 'ongoing') return false;
      if (statusLower === 'completed' && tournament.status !== 'completed') return false;
    }
    
    return true;
  });
  
  // Sort tournaments
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return (dateA - dateB) * multiplier;
    }
    
    if (sortBy === 'prize') {
      return (a.prize - b.prize) * multiplier;
    }
    
    if (sortBy === 'participants') {
      return (a.participants - b.participants) * multiplier;
    }
    
    return 0;
  });
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedGame('all');
    setSearchQuery('');
    setPrizeFilter('');
    setDateFilter('');
    setRegionFilter('All');
    setStatusFilter('All');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

    return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
                      <h1 className="page-title md:text-5xl">
            Competitive Tournaments
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the competition and prove your skills. Compete against the best players and win amazing prizes!
          </p>
        </div>
        
        {/* Game Selector */}
        <div className="mb-8">
          <HorizontalGameSelector 
            games={GAMES}
            onGameSelect={setSelectedGame}
            selectedGameId={selectedGame}
          />
        </div>
        
        {/* Filter Bar */}
        <div className="card-container p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                                 <input
                   type="text"
                   placeholder="Search tournaments..."
                                      className="input-field px-4 py-3 pl-10 focus:ring-2 focus:ring-primary"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                <svg 
                  className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-3">
                             <Button 
                 onClick={() => setIsFilterOpen(!isFilterOpen)}
                 className="bg-input-background hover:bg-border-dark px-4 py-2 rounded-lg flex items-center gap-2"
               >
                <svg 
                  className="h-5 w-5 text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                  />
                </svg>
                Filters
              </Button>
              
                             <Button 
                 onClick={resetFilters}
                 className="bg-input-background hover:bg-border-dark px-4 py-2 rounded-lg"
               >
                 Reset
               </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {isFilterOpen && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Min Prize</label>
                                 <input
                   type="number"
                   placeholder="$0"
                   className="input-field px-4 py-2 focus:ring-2 focus:ring-primary"
                   value={prizeFilter}
                   onChange={(e) => setPrizeFilter(e.target.value ? Number(e.target.value) : '')}
                 />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Starting After</label>
                                 <input
                   type="date"
                   className="input-field px-4 py-2 focus:ring-2 focus:ring-primary"
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                 />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Region</label>
                                 <select
                   className="input-field px-4 py-2 focus:ring-2 focus:ring-primary"
                   value={regionFilter}
                   onChange={(e) => setRegionFilter(e.target.value)}
                 >
                  {REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                                 <select
                   className="input-field px-4 py-2 focus:ring-2 focus:ring-primary"
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                 >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Sort By</label>
                <div className="flex gap-2">
                                     <select
                     className="flex-1 input-field px-4 py-2 focus:ring-2 focus:ring-primary"
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                   >
                    <option value="date">Date</option>
                    <option value="prize">Prize</option>
                    <option value="participants">Participants</option>
                  </select>
                                     <button
                     onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                     className="bg-input-background hover:bg-border-dark px-3 rounded-lg border border-border-dark"
                   >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedTournaments.map(tournament => {
            const game = GAMES.find(g => g.id === tournament.game);
            const formattedDate = formatDate(tournament.date);
            const formattedPrize = formatCurrency(tournament.prize);
            const formattedEntryFee = formatCurrency(tournament.entryFee);
            
            return (
                             <div 
                 key={tournament.id} 
                 className={`card-container transition-all ${
                   tournament.status === 'ongoing' 
                     ? 'border-green-500/30 hover:border-green-500' 
                     : tournament.status === 'completed'
                       ? 'border-gray-500/30 hover:border-gray-500'
                       : 'border-border-dark hover:border-primary'
                 }`}
               >
                <div className="p-6 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {game && (
                      <div className="bg-gray-800 rounded-lg p-2">
                        <div className="relative w-12 h-12">
                          <Image 
                            src={game.imageUrl} 
                            alt={game.name} 
                            layout="fill"
                            objectFit="contain"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{tournament.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 text-sm">{game?.name}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400 text-sm">{tournament.region}</span>
                      </div>
                    </div>
                  </div>
                  
                                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                     tournament.status === 'ongoing' 
                       ? 'bg-green-500/20 text-green-400' 
                       : tournament.status === 'completed'
                         ? 'bg-gray-500/20 text-gray-400'
                         : 'bg-primary/20 text-primary'
                   }`}>
                     {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                   </span>
                </div>
                
                <div className="p-6 pt-0 grid grid-cols-3 gap-4">
                                   <div className="bg-input-background p-4 rounded-lg">
                   <p className="text-gray-400 text-sm">Prize Pool</p>
                   <p className="text-xl font-bold text-primary">{formattedPrize}</p>
                 </div>
                  
                                     <div className="bg-input-background p-4 rounded-lg">
                     <p className="text-gray-400 text-sm">Start Date</p>
                     <p className="text-xl font-bold">{formattedDate}</p>
                   </div>
                   
                   <div className="bg-input-background p-4 rounded-lg">
                     <p className="text-gray-400 text-sm">Entry Fee</p>
                     <p className="text-xl font-bold">{formattedEntryFee}</p>
                   </div>
                </div>
                
                <div className="p-6 pt-0 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                      />
                    </svg>
                    <span>{tournament.participants} teams</span>
                  </div>
                  
                                                                           <Button className="primary-button px-6 py-3">
                     {tournament.status === 'completed' ? 'View Results' : tournament.status === 'ongoing' ? 'Join Now' : 'Register'}
                   </Button>
                </div>
              </div>
            );
          })}
        </div>
        
                 {/* Empty State */}
         {sortedTournaments.length === 0 && (
           <div className="text-center py-20 card-container mt-6">
            <div className="bg-gray-800 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
              <svg 
                className="h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">No tournaments found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search term to find what you&apos;re looking for.
            </p>
                                                   <Button 
                onClick={resetFilters}
                className="primary-button px-8 py-3"
              >
               Reset Filters
             </Button>
          </div>
        )}
        
                 {/* Stats Bar */}
         <div className="mt-12 card-container p-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="text-center p-4">
               <div className="text-4xl font-bold text-primary mb-2">
                 {formatCurrency(TOURNAMENTS.reduce((sum, t) => sum + t.prize, 0))}
               </div>
               <p className="text-gray-400">Total Prize Money</p>
             </div>
             
                          <div className="text-center p-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  {TOURNAMENTS.reduce((sum, t) => sum + t.participants, 0)}
                </div>
                <p className="text-gray-400">Total Participants</p>
              </div>
             
                          <div className="text-center p-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  {TOURNAMENTS.length}
                </div>
                <p className="text-gray-400">Total Tournaments</p>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}