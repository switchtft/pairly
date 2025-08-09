'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
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

interface LeaderboardWidgetProps {
  period?: 'weekly' | 'monthly' | 'all-time';
  game?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

const GAMES = [
  { id: 'valorant', name: 'Valorant', image: '/images/games/valorant.jpg' },
  { id: 'league', name: 'League of Legends', image: '/images/games/league.jpg' },
  { id: 'csgo', name: 'CS:GO 2', image: '/images/games/csgo.jpg' }
];

export default function LeaderboardWidget({ 
  period = 'weekly', 
  game, 
  limit = 10, 
  showHeader = true,
  className = ''
}: LeaderboardWidgetProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, game, limit]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period,
        limit: limit.toString()
      });
      
      if (game) {
        params.append('game', game);
      }

      const response = await fetch(`/api/leaderboard?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
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
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <Star className="w-4 h-4 text-blue-500" />;
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
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e6915b]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={fetchLeaderboard}
              className="mt-2 text-[#e6915b] text-sm hover:underline"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-[#e6915b]" />
            Top Players
            {game && (
              <Badge variant="outline" className="ml-2 text-xs">
                {GAMES.find(g => g.id === game)?.name || game}
              </Badge>
            )}
            <Badge variant="outline" className="ml-auto text-xs capitalize">
              {period}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No rankings yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((entry) => (
              <div 
                key={entry.userId} 
                className="flex items-center gap-3 p-3 hover:bg-[#1a1a1a]/50 transition-colors"
              >
                {/* Rank */}
                <div className="flex items-center gap-2 min-w-[60px]">
                  <div className={`w-8 h-8 rounded-full ${getRankColor(entry.rank)} flex items-center justify-center text-white font-bold text-sm`}>
                    #{entry.rank}
                  </div>
                  {entry.rank <= 3 && getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e6915b]/30">
                  {entry.avatar ? (
                    <Image
                      src={entry.avatar}
                      alt={entry.username}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#e6915b] to-[#6b8ab0] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {entry.firstName?.[0] || entry.username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{entry.username}</span>
                    {entry.isPro && (
                      <Badge className="bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] text-white text-xs px-1 py-0">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Image
                      src={getGameImage(entry.game)}
                      alt={entry.game}
                      width={12}
                      height={12}
                      className="rounded"
                    />
                    <span className="capitalize">{entry.game}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right min-w-[60px]">
                  <div className="font-bold text-[#e6915b] text-sm">
                    {formatPoints(entry.points)}
                  </div>
                  <div className="text-xs text-gray-500">pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {leaderboardData.length > 0 && (
          <div className="p-3 border-t border-[#2a2a2a]">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Showing top {leaderboardData.length} players</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span className="capitalize">{period}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
