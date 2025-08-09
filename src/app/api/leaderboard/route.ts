import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'all';
    const timeFrame = searchParams.get('timeFrame') || 'month'; // week, month, year, all
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const whereClause: {
      game?: string;
      createdAt?: { gte: Date };
    } = {};
    
    if (game !== 'all') {
      whereClause.game = game;
    }

    // Add time frame filter
    if (timeFrame !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeFrame) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      whereClause.createdAt = {
        gte: startDate,
      };
    }

    // Get leaderboard entries
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            game: true,
            rank: true,
          },
        },
      },
      orderBy: [
        { points: 'desc' },
        { createdAt: 'asc' },
      ],
      take: limit,
    });

    // Format leaderboard data
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.username,
      avatar: entry.user.avatar,
      game: entry.user.game,
      userRank: entry.user.rank,
      points: entry.points,
      leaderboardRank: entry.rank,
      period: entry.period,
      lastUpdated: entry.updatedAt,
    }));

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      filters: {
        game,
        timeFrame,
        limit,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
