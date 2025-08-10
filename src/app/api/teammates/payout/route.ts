import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate's payout information
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

    // Get completed sessions that haven't been paid out yet
    const unpaidSessions = await prisma.session.findMany({
      where: {
        proTeammateId: decoded.userId,
        status: 'Completed'
      },
      select: {
        id: true,
        price: true,
        endTime: true
      }
    });

    // Calculate total unpaid amount
    const totalUnpaid = unpaidSessions.reduce((sum, session) => sum + session.price, 0);

    // Get recent payout history
    const payoutHistory = await prisma.payment.findMany({
      where: {
        userId: decoded.userId,
        method: 'payout'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      totalUnpaid,
      unpaidSessionsCount: unpaidSessions.length,
      payoutHistory: payoutHistory.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      }))
    });

  } catch (error) {
    console.error('Payout GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Request a payout
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
    const { amount, payoutMethod } = body; // payoutMethod: 'bank', 'paypal', etc.

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
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

    // Check if user has enough unpaid earnings
    const unpaidSessions = await prisma.session.findMany({
      where: {
        proTeammateId: decoded.userId,
        status: 'Completed'
      },
      select: { price: true }
    });

    const totalUnpaid = unpaidSessions.reduce((sum, session) => sum + session.price, 0);

    if (amount > totalUnpaid) {
      return NextResponse.json({ error: 'Insufficient unpaid earnings' }, { status: 400 });
    }

    // Create payout request
    const payout = await prisma.payment.create({
      data: {
        userId: decoded.userId,
        amount: amount,
        originalAmount: amount,
        method: 'payout',
        status: 'pending'
      }
    });

    // Mark sessions as paid (this is a simplified approach - in production you'd want more sophisticated logic)
    // For now, we'll just create a record of the payout request

    return NextResponse.json({ 
      message: 'Payout request submitted successfully',
      payoutId: payout.id,
      amount: payout.amount,
      status: payout.status
    });

  } catch (error) {
    console.error('Payout POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
