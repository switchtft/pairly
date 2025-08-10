import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate's order history
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
        userType: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const game = searchParams.get('game');

    // Build where clause
    const whereClause: {
      proTeammateId: number;
      status?: string;
      game?: string;
    } = {
      proTeammateId: decoded.userId
    };

    if (status) {
      whereClause.status = status;
    }

    if (game) {
      whereClause.game = game;
    }

    // Get sessions with pagination
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            game: true,
            rank: true
          }
        },
        reviews: {
          where: { reviewedId: decoded.userId },
          select: {
            rating: true,
            comment: true,
            createdAt: true
          }
        }
      },
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalSessions = await prisma.session.count({
      where: whereClause
    });

    // Get session statistics
    const stats = await prisma.$transaction([
      prisma.session.count({
        where: { proTeammateId: decoded.userId, status: 'Completed' }
      }),
      prisma.session.count({
        where: { proTeammateId: decoded.userId, status: 'Cancelled' }
      }),
      prisma.session.aggregate({
        where: { proTeammateId: decoded.userId, status: 'Completed' },
        _sum: { price: true }
      }),
      prisma.review.aggregate({
        where: { reviewedId: decoded.userId },
        _avg: { rating: true },
        _count: true
      })
    ]);

    const [completedSessions, cancelledSessions, totalEarnings, reviewStats] = stats;

    const orderHistory = sessions.map(session => {
      const review = session.reviews[0];
      const winLoss = session.status === 'Completed' ? 'W' : session.status === 'Cancelled' ? 'L' : '-';
      
      return {
        id: session.id,
        date: session.startTime,
        client: {
          id: session.client.id,
          username: session.client.username,
          name: `${session.client.firstName || ''} ${session.client.lastName || ''}`.trim() || session.client.username,
          avatar: session.client.avatar,
          game: session.client.game,
          rank: session.client.rank
        },
        game: session.game,
        mode: session.mode,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        price: session.price,
        winLoss,
        review: review ? {
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        } : null
      };
    });

    return NextResponse.json({
      orderHistory,
      pagination: {
        page,
        limit,
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limit)
      },
      stats: {
        totalSessions: totalSessions,
        completedSessions,
        cancelledSessions,
        totalEarnings: totalEarnings._sum.price || 0,
        averageRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count || 0
      }
    });

  } catch (error) {
    console.error('Order history GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
