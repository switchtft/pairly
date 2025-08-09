import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate dashboard data
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

    // Verify user is a teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        isPro: true, 
        userType: true,
        isOnline: true 
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Get current date and start of week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get weekly stats
    const weeklySessions = await prisma.session.findMany({
      where: {
        proTeammateId: decoded.userId,
        startTime: { gte: startOfWeek },
        status: 'Completed'
      }
    });

    const weeklyStats = {
      totalPayment: weeklySessions.reduce((sum, session) => sum + session.price, 0),
      numberOfOrders: weeklySessions.length,
      winRate: 0 // Will be calculated from session results
    };

    // Get total sessions count
    const totalSessions = await prisma.session.count({
      where: {
        proTeammateId: decoded.userId,
        status: 'Completed'
      }
    });

    // Get average rating
    const reviews = await prisma.review.aggregate({
      where: { reviewedId: decoded.userId },
      _avg: { rating: true },
      _count: true
    });

    const rating = reviews._avg.rating || 0;
    const reviewCount = reviews._count || 0;

    // Get leaderboard position
    const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId: decoded.userId,
        period: 'weekly'
      },
      orderBy: { points: 'desc' }
    });

    // Get recent order history
    const orderHistory = await prisma.session.findMany({
      where: {
        proTeammateId: decoded.userId,
        status: 'Completed'
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { endTime: 'desc' },
      take: 20
    });

    // Get available quests
    const availableQuests = await prisma.quest.findMany({
      where: { isActive: true },
      include: {
        completions: {
          where: { userId: decoded.userId }
        }
      }
    });

    const questsWithProgress = availableQuests.map(quest => ({
      ...quest,
      isCompleted: quest.completions.length > 0,
      completedAt: quest.completions[0]?.completedAt || null
    }));

    return NextResponse.json({
      onlineStatus: user.isOnline,
      weeklyStats,
      totalSessions,
      rating: {
        average: rating,
        count: reviewCount
      },
      leaderboardPosition: leaderboardEntry?.rank || 0,
      orderHistory: orderHistory.map(session => ({
        id: session.id,
        date: session.endTime?.toLocaleDateString('en-GB') || '',
        time: session.endTime?.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) || '',
        customerName: session.client.username,
        gameType: session.game,
        result: 'W', // Placeholder - will be implemented with actual game results
        price: session.price
      })),
      availableQuests: questsWithProgress
    });

  } catch (error) {
    console.error('Teammate dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update teammate online status
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { isOnline } = body;

    // Verify user is a teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true, userType: true }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Update online status
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        isOnline,
        lastSeen: new Date()
      },
      select: { isOnline: true, lastSeen: true }
    });

    return NextResponse.json({ 
      onlineStatus: updatedUser.isOnline,
      lastSeen: updatedUser.lastSeen
    });

  } catch (error) {
    console.error('Teammate dashboard PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
