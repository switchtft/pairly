import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Request payout for an order
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
      select: { isPro: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Check if order exists and belongs to this teammate
    const order = await prisma.session.findUnique({
      where: { 
        id: orderId,
        proTeammateId: decoded.userId,
        status: 'Completed'
      },
      include: {
        payments: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or not completed' }, { status: 404 });
    }

    // Check if payout already requested
    const existingPayout = order.payments.find(payment => payment.status === 'Requested');
    if (existingPayout) {
      return NextResponse.json({ error: 'Payout already requested for this order' }, { status: 400 });
    }

    // Create or update payment record
    if (order.payments.length > 0) {
      // Update existing payment
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: { status: 'Requested' }
      });
    } else {
             // Create new payment record
       await prisma.payment.create({
         data: {
           sessionId: orderId,
           amount: order.price,
           status: 'Requested',
           method: 'Payout',
           userId: decoded.userId
         }
       });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payout requested successfully'
    });

  } catch (error) {
    console.error('Request payout POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
