import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Reject an order
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

    // Check if order exists
    const order = await prisma.session.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'Pending') {
      return NextResponse.json({ error: 'Order is no longer available' }, { status: 400 });
    }

    // For rejection, we just return success - the order remains available for other teammates
    // In a real system, you might want to track rejections or implement a cooldown

    return NextResponse.json({ 
      success: true, 
      message: 'Order rejected'
    });

  } catch (error) {
    console.error('Reject order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
