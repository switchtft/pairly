import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const game = searchParams.get('game');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate period
    if (!['weekly', 'monthly', 'all-time'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    // Build where clause
    const whereClause: any = { period };
    if (game) {
      whereClause.user = { game };
    }

    // Get leaderboard entries
    const leaderboardEntries = await prisma.leaderboardEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            game: true,
            userType: true,
            isPro: true
          }
        }
      },
      orderBy: { points: 'desc' },
      take: limit
    });

    // Calculate ranks
    const leaderboard = leaderboardEntries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.user.username,
      firstName: entry.user.firstName,
      lastName: entry.user.lastName,
      avatar: entry.user.avatar,
      game: entry.user.game,
      userType: entry.user.userType,
      isPro: entry.user.isPro,
      points: entry.points,
      period: entry.period
    }));

    // Get current user's position if they are a teammate
    let currentUserPosition = null;
    if (decoded.userType === 'teammate') {
      const userEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId: decoded.userId,
          period
        },
        orderBy: { points: 'desc' }
      });

      if (userEntry) {
        // Count how many users have more points than current user
        const higherRankedUsers = await prisma.leaderboardEntry.count({
          where: {
            period,
            points: { gt: userEntry.points }
          }
        });

        currentUserPosition = {
          rank: higherRankedUsers + 1,
          points: userEntry.points
        };
      }
    }

    return NextResponse.json({
      leaderboard,
      period,
      game,
      currentUserPosition,
      total: leaderboard.length
    });

  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
