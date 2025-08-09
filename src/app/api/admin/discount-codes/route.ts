import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - List all discount codes
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const discountCodes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true }
        }
      }
    });

    return NextResponse.json(discountCodes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new discount code
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      maxUses,
      validUntil,
      minAmount,
      applicableGames
    } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate discount type
    if (!['percentage', 'fixed', 'free'].includes(discountType)) {
      return NextResponse.json({ error: 'Invalid discount type' }, { status: 400 });
    }

    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 0 and 100' }, { status: 400 });
    }

    if (discountType === 'fixed' && discountValue < 0) {
      return NextResponse.json({ error: 'Fixed discount cannot be negative' }, { status: 400 });
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }

    // Create discount code
    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses: maxUses || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        createdBy: decoded.userId,
        minAmount: minAmount || 0,
        applicableGames: applicableGames || 'all',
      }
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update discount code
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Discount code ID is required' }, { status: 400 });
    }

    // Update discount code
    const discountCode = await prisma.discountCode.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error updating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete discount code
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount code ID is required' }, { status: 400 });
    }

    // Delete discount code
    await prisma.discountCode.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 