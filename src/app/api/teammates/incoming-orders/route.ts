import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get incoming orders for teammate
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
      select: { isPro: true, game: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Get pending sessions for this teammate's game (simplified query without blocking for now)
    const orders = await prisma.session.findMany({
      where: {
        game: user.game || undefined,
        status: 'Pending',
        proTeammateId: null // Not yet assigned
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
      orderBy: {
        startTime: 'asc'
      },
      take: 10
    });

    // Transform to match frontend interface
    const transformedOrders = orders.map(order => ({
      id: order.id,
      clientId: order.clientId,
      clientName: order.client.username,
      clientAvatar: order.client.avatar,
      game: order.game,
      mode: order.mode,
      duration: order.duration || 0,
      price: order.price,
      createdAt: order.startTime.toISOString()
    }));

    return NextResponse.json({ orders: transformedOrders });

  } catch (error) {
    console.error('Incoming orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
