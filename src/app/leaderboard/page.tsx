'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Filter, 
  Calendar,
  Gamepad2,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  game: string;
  userType: string;
  isPro: boolean;
  points: number;
  period: string;
}

interface CurrentUserPosition {
  rank: number;
  points: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  period: string;
  game?: string;
  currentUserPosition?: CurrentUserPosition;
  total: number;
}

const PERIODS = [
  { value: 'weekly', label: 'Weekly', icon: Calendar },
  { value: 'monthly', label: 'Monthly', icon: TrendingUp },
  { value: 'all-time', label: 'All Time', icon: Trophy }
];

const GAMES = [
  { id: 'valorant', name: 'Valorant', image: '/images/games/valorant.jpg' },
  { id: 'league', name: 'League of Legends', image: '/images/games/league.jpg' },
  { id: 'csgo', name: 'CS:GO 2', image: '/images/games/csgo.jpg' }
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedGame, setSelectedGame] = useState<string>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod, selectedGame]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        limit: '100'
      });
      
      if (selectedGame !== 'all') {
        params.append('game', selectedGame);
      }

      const response = await fetch(`/api/leaderboard?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        setError('Failed to fetch leaderboard data');
      }
    } catch (error) {
      setError('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Star className="w-6 h-6 text-blue-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gradient-to-r from-blue-500 to-blue-700';
  };

  const formatPoints = (points: number) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  const getGameImage = (gameId: string) => {
    const game = GAMES.find(g => g.id === gameId);
    return game?.image || '/images/games/valorant.jpg';
  };

  if (loading) {
    return (
      <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e6915b] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-[#e6915b]" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compete with the best players and climb the rankings. Show your skills and earn your place at the top!
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#e6915b]" />
              <span className="text-[#e6915b] font-medium">Period:</span>
              <div className="flex gap-2">
                {PERIODS.map((period) => {
                  const IconComponent = period.icon;
                  return (
                    <Button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      variant={selectedPeriod === period.value ? 'default' : 'outline'}
                      className={`flex items-center gap-2 ${
                        selectedPeriod === period.value
                          ? 'bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]'
                          : 'border-[#e6915b]/30 text-[#e6915b] hover:border-[#e6915b] hover:bg-[#e6915b]/10'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {period.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Game Selector */}
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#e6915b]" />
              <span className="text-[#e6915b] font-medium">Game:</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedGame('all')}
                  variant={selectedGame === 'all' ? 'default' : 'outline'}
                  className={selectedGame === 'all' 
                    ? 'bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]' 
                    : 'border-[#e6915b]/30 text-[#e6915b] hover:border-[#e6915b] hover:bg-[#e6915b]/10'
                  }
                >
                  All Games
                </Button>
                {GAMES.map((game) => (
                  <Button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    variant={selectedGame === game.id ? 'default' : 'outline'}
                    className={`flex items-center gap-2 ${
                      selectedGame === game.id
                        ? 'bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]'
                        : 'border-[#e6915b]/30 text-[#e6915b] hover:border-[#e6915b] hover:bg-[#e6915b]/10'
                    }`}
                  >
                    <Image
                      src={game.image}
                      alt={game.name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                    {game.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current User Position */}
        {leaderboardData?.currentUserPosition && (
          <div className="bg-gradient-to-r from-[#e6915b]/20 to-[#6b8ab0]/20 rounded-xl p-6 border border-[#e6915b]/30 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#e6915b]">Your Position</h3>
                  <p className="text-gray-400">Keep climbing the ranks!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#e6915b]">
                  #{leaderboardData.currentUserPosition.rank}
                </div>
                <div className="text-gray-400">
                  {formatPoints(leaderboardData.currentUserPosition.points)} points
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={fetchLeaderboard}
              className="mt-4 bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
            >
              Try Again
            </Button>
          </div>
        ) : leaderboardData?.leaderboard ? (
          <div className="space-y-4">
            {/* Top 3 Podium */}
            {leaderboardData.leaderboard.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {leaderboardData.leaderboard.slice(0, 3).map((entry, index) => (
                  <Card 
                    key={entry.userId} 
                    className={`border-2 overflow-hidden ${
                      index === 0 ? 'border-yellow-500/50' :
                      index === 1 ? 'border-gray-400/50' :
                      'border-amber-600/50'
                    }`}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-2">
                        {getRankIcon(entry.rank)}
                      </div>
                      <CardTitle className="text-lg text-[#e6915b]">
                        #{entry.rank} Place
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[#e6915b]/30">
                        {entry.avatar ? (
                          <Image
                            src={entry.avatar}
                            alt={entry.username}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e6915b] to-[#6b8ab0] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {entry.firstName?.[0] || entry.username[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{entry.username}</h3>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Image
                          src={getGameImage(entry.game)}
                          alt={entry.game}
                          width={16}
                          height={16}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-400 capitalize">{entry.game}</span>
                      </div>
                      <div className="text-2xl font-bold text-[#e6915b]">
                        {formatPoints(entry.points)}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                      {entry.isPro && (
                        <Badge className="mt-2 bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] text-white">
                          PRO
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="space-y-3">
              {leaderboardData.leaderboard.slice(3).map((entry) => (
                <Card key={entry.userId} className="border border-[#2a2a2a] hover:border-[#e6915b]/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full ${getRankColor(entry.rank)} flex items-center justify-center text-white font-bold text-lg`}>
                        #{entry.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#e6915b]/30">
                        {entry.avatar ? (
                          <Image
                            src={entry.avatar}
                            alt={entry.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e6915b] to-[#6b8ab0] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {entry.firstName?.[0] || entry.username[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{entry.username}</h3>
                          {entry.isPro && (
                            <Badge className="bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] text-white text-xs">
                              PRO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Image
                              src={getGameImage(entry.game)}
                              alt={entry.game}
                              width={14}
                              height={14}
                              className="rounded"
                            />
                            <span className="capitalize">{entry.game}</span>
                          </div>
                          <span>•</span>
                          <span className="capitalize">{entry.userType}</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#e6915b]">
                          {formatPoints(entry.points)}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {leaderboardData.leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Rankings Yet</h3>
                <p className="text-gray-500">Be the first to earn points and climb the leaderboard!</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Stats */}
        {leaderboardData && (
          <div className="mt-12 bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-[#e6915b] mb-2">
                  {leaderboardData.total}
                </div>
                <p className="text-gray-400">Total Players</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-[#6b8ab0] mb-2">
                  {leaderboardData.leaderboard.filter(e => e.isPro).length}
                </div>
                <p className="text-gray-400">Pro Players</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-[#8a675e] mb-2">
                  {leaderboardData.period}
                </div>
                <p className="text-gray-400">Current Period</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
