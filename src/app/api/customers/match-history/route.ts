import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get customer's match history
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

    // Verify user is a customer
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        userType: true
      }
    });

    if (!user || user.userType !== 'customer') {
      return NextResponse.json({ error: 'Not authorized as customer' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const game = searchParams.get('game');
    const status = searchParams.get('status');

    // Build where clause
    const whereClause: any = {
      clientId: decoded.userId
    };

    if (game) {
      whereClause.game = game;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get sessions with pagination
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        proTeammate: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            game: true,
            rank: true
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
        where: { clientId: decoded.userId, status: 'Completed' }
      }),
      prisma.session.count({
        where: { clientId: decoded.userId, status: 'Cancelled' }
      }),
      prisma.payment.aggregate({
        where: { 
          userId: decoded.userId, 
          status: 'completed',
          method: { not: 'payout' }
        },
        _sum: { amount: true }
      })
    ]);

    const [completedSessions, cancelledSessions, totalSpent] = stats;

    const matchHistory = sessions.map(session => ({
      id: session.id,
      game: session.game,
      mode: session.mode,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      price: session.price,
      teammate: session.proTeammate ? {
        id: session.proTeammate.id,
        username: session.proTeammate.username,
        name: `${session.proTeammate.firstName || ''} ${session.proTeammate.lastName || ''}`.trim() || session.proTeammate.username,
        avatar: session.proTeammate.avatar,
        game: session.proTeammate.game,
        rank: session.proTeammate.rank
      } : null
    }));

    return NextResponse.json({
      matchHistory,
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
        totalSpent: totalSpent._sum.amount || 0
      }
    });

  } catch (error) {
    console.error('Match history GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
