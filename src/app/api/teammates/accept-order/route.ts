import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Accept an order
export async function POST(request: NextRequest) {
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

    if (!user.isOnline) {
      return NextResponse.json({ error: 'Must be online to accept orders' }, { status: 400 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Check if order exists and is available
    const order = await prisma.session.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'Pending') {
      return NextResponse.json({ error: 'Order is no longer available' }, { status: 400 });
    }

    if (order.proTeammateId) {
      return NextResponse.json({ error: 'Order already assigned' }, { status: 400 });
    }

    // Check if teammate is already in an active session
    const activeSession = await prisma.session.findFirst({
      where: {
        proTeammateId: decoded.userId,
        status: {
          in: ['Pending', 'Active']
        }
      }
    });

    if (activeSession) {
      return NextResponse.json({ error: 'You are already in an active session' }, { status: 400 });
    }

    // Accept the order
    const updatedOrder = await prisma.session.update({
      where: { id: orderId },
      data: {
        proTeammateId: decoded.userId,
        status: 'Active'
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
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Order accepted successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Accept order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
