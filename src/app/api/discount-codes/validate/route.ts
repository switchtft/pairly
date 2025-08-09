import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    const { code, amount, game } = await request.json();

    if (!code || !amount) {
      return NextResponse.json({ error: 'Code and amount are required' }, { status: 400 });
    }

    // Find the discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 });
    }

    // Check if code is active
    if (!discountCode.isActive) {
      return NextResponse.json({ error: 'Discount code is inactive' }, { status: 400 });
    }

    // Check if code has expired
    if (discountCode.validUntil && new Date() > discountCode.validUntil) {
      return NextResponse.json({ error: 'Discount code has expired' }, { status: 400 });
    }

    // Check if code has reached max uses
    if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
      return NextResponse.json({ error: 'Discount code usage limit reached' }, { status: 400 });
    }

    // Check minimum amount requirement
    if (amount < discountCode.minAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount of $${discountCode.minAmount} required` 
      }, { status: 400 });
    }

    // Check if code applies to this game
    if (discountCode.applicableGames.length > 0 && 
        !discountCode.applicableGames.includes(game)) {
      return NextResponse.json({ 
        error: 'Discount code does not apply to this game' 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.discountType === 'percentage') {
      discountAmount = (amount * discountCode.discountValue) / 100;
    } else if (discountCode.discountType === 'fixed') {
      discountAmount = discountCode.discountValue;
    } else if (discountCode.discountType === 'free') {
      discountAmount = amount; // 100% off
    }

    // Ensure discount doesn't exceed the total amount
    discountAmount = Math.min(discountAmount, amount);

    return NextResponse.json({
      code: discountCode.code,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      discountType: discountCode.discountType,
      description: discountCode.description,
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 