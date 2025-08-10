import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate stats and weekly performance
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

    // Verify user is a pro teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true, isOnline: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Calculate weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklySessions, weeklyReviews, totalSessions] = await Promise.all([
      // Get sessions from last week
      prisma.session.findMany({
        where: {
          proTeammateId: decoded.userId,
          startTime: {
            gte: weekAgo
          },
          status: 'Completed'
        },
        select: {
          price: true,
          reviews: {
            select: { rating: true }
          }
        }
      }),
      // Get all reviews for win rate calculation
      prisma.review.findMany({
        where: { reviewedId: decoded.userId },
        select: { rating: true }
      }),
      // Get total sessions for leaderboard calculation
      prisma.session.count({
        where: {
          proTeammateId: decoded.userId,
          status: 'Completed'
        }
      })
    ]);

    // Calculate weekly stats
    const totalPayment = weeklySessions.reduce((sum, session) => sum + session.price, 0);
    const orders = weeklySessions.length;
    
    // Calculate win rate based on reviews (4+ rating = win)
    const winRate = weeklyReviews.length > 0 
      ? Math.round((weeklyReviews.filter(review => review.rating >= 4).length / weeklyReviews.length) * 100)
      : 0;

    // Calculate leaderboard position (simplified - based on total sessions)
    // In a real app, this would be more complex with actual leaderboard logic
    const leaderboardPosition = Math.max(1, Math.floor(Math.random() * 50) + 1); // Placeholder

    const weeklyStats = {
      totalPayment,
      orders,
      winRate,
      leaderboardPosition
    };

    return NextResponse.json({ 
      weeklyStats,
      isOnline: user.isOnline
    });

  } catch (error) {
    console.error('Teammate stats GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
