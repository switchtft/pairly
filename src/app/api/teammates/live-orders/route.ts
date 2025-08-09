import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get live orders available for teammates
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
        game: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Get live orders (queue entries that are paid and waiting)
    const liveOrders = await prisma.queueEntry.findMany({
      where: {
        game: user.game, // Only show orders for teammate's game
        status: 'waiting',
        paymentStatus: 'paid'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rank: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Filter out orders from blocked customers
    const blockedCustomers = await prisma.blockedCustomer.findMany({
      where: { teammateId: decoded.userId },
      select: { customerId: true }
    });

    const blockedCustomerIds = blockedCustomers.map(b => b.customerId);
    
    const filteredOrders = liveOrders.filter(order => 
      !blockedCustomerIds.includes(order.userId)
    );

    return NextResponse.json({
      liveOrders: filteredOrders.map(order => ({
        id: order.id,
        customerName: order.user.username,
        customerAvatar: order.user.avatar,
        gameType: order.game,
        gameMode: order.gameMode,
        numberOfMatches: order.numberOfMatches,
        duration: order.duration,
        price: order.totalPrice,
        specialRequests: order.specialRequests,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    console.error('Live orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Accept or reject an order
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

    const body = await request.json();
    const { orderId, action } = body; // action: 'accept' or 'reject'

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

    if (!user.isOnline) {
      return NextResponse.json({ error: 'Must be online to accept orders' }, { status: 400 });
    }

    // Get the order
    const order = await prisma.queueEntry.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'waiting') {
      return NextResponse.json({ error: 'Order is no longer available' }, { status: 400 });
    }

    if (action === 'accept') {
      // Create a session from the queue entry
      const session = await prisma.session.create({
        data: {
          clientId: order.userId,
          proTeammateId: decoded.userId,
          game: order.game,
          mode: order.gameMode,
          status: 'Pending',
          startTime: new Date(),
          price: order.totalPrice,
          duration: order.duration
        }
      });

      // Update queue entry status
      await prisma.queueEntry.update({
        where: { id: orderId },
        data: { status: 'matched' }
      });

      return NextResponse.json({ 
        message: 'Order accepted successfully',
        sessionId: session.id
      });

    } else {
      // Reject order - just return success (order remains available for other teammates)
      return NextResponse.json({ 
        message: 'Order rejected'
      });
    }

  } catch (error) {
    console.error('Live orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
