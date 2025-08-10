import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate order history
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
      select: { isPro: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Get completed sessions for this teammate
    const orders = await prisma.session.findMany({
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
        },
        reviews: {
          select: {
            rating: true
          }
        },
        payments: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 50 // Limit to 50 most recent
    });

    // Transform to match frontend interface
    const transformedOrders = orders.map(order => {
      // Determine result based on reviews
      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (order.reviews.length > 0) {
        const avgRating = order.reviews.reduce((sum, review) => sum + review.rating, 0) / order.reviews.length;
        result = avgRating >= 4 ? 'win' : avgRating >= 2 ? 'draw' : 'loss';
      }

      return {
        id: order.id,
        clientId: order.clientId,
        clientName: order.client.username,
        clientAvatar: order.client.avatar,
        game: order.game,
        mode: order.mode,
        result,
        price: order.price,
        createdAt: order.startTime.toISOString(),
        status: order.status as 'completed' | 'pending' | 'cancelled',
        payoutRequested: order.payments.some(payment => payment.status === 'Requested')
      };
    });

    return NextResponse.json({ orders: transformedOrders });

  } catch (error) {
    console.error('Order history GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
