import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get user's match history
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

    // Get sessions where user is either client or teammate
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId }
        ],
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
        },
        proTeammate: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true
          }
        },
        payments: {
          select: {
            amount: true,
            status: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    // Transform sessions into match history format
    const matchHistory = sessions.map(session => {
      const isClient = session.clientId === decoded.userId;
      const teammate = isClient ? session.proTeammate : session.client;
      const client = isClient ? session.client : session.proTeammate;
      
      // Determine result based on reviews or session status
      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (session.reviews.length > 0) {
        const avgRating = session.reviews.reduce((sum, review) => sum + review.rating, 0) / session.reviews.length;
        result = avgRating >= 4 ? 'win' : avgRating >= 2 ? 'draw' : 'loss';
      }

      return {
        id: session.id,
        date: session.startTime.toISOString(),
        game: session.game,
        result,
        teammateId: teammate?.id || 0,
        teammateName: teammate?.username || 'Unknown',
        teammateAvatar: teammate?.avatar || '',
        price: session.price,
        duration: session.duration || 0,
        mode: session.mode,
        status: session.status,
        reviews: session.reviews,
        paymentStatus: session.payments[0]?.status || 'Pending'
      };
    });

    return NextResponse.json({ matchHistory });

  } catch (error) {
    console.error('Match history GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
