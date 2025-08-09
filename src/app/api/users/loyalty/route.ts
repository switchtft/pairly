import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get user's loyalty information
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        accountBalance: true,
        userType: true,
        _count: {
          select: {
            sessions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate loyalty tier information
    const tierInfo = getLoyaltyTierInfo(user.loyaltyTier);
    const nextTier = getNextTier(user.loyaltyTier);
    const pointsToNextTier = nextTier ? nextTier.minPoints - user.loyaltyPoints : 0;

    return NextResponse.json({
      loyalty: {
        currentPoints: user.loyaltyPoints,
        currentTier: user.loyaltyTier,
        tierInfo,
        nextTier,
        pointsToNextTier,
        totalSessions: user._count.sessions,
        accountBalance: user.accountBalance
      }
    });

  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add loyalty points (admin only)
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

    // Verify user is an admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, points, reason } = body;

    if (!userId || !points || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current user loyalty info
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        loyaltyPoints: true,
        loyaltyTier: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Calculate new points and tier
    const newPoints = targetUser.loyaltyPoints + parseInt(points);
    const newTier = calculateLoyaltyTier(newPoints);

    // Update user loyalty
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
        updatedAt: new Date()
      },
      select: {
        id: true,
        loyaltyPoints: true,
        loyaltyTier: true
      }
    });

    // Log loyalty transaction
    await prisma.loyaltyTransaction.create({
      data: {
        userId: parseInt(userId),
        points: parseInt(points),
        reason,
        adminId: decoded.userId,
        previousPoints: targetUser.loyaltyPoints,
        newPoints,
        previousTier: targetUser.loyaltyTier,
        newTier
      }
    });

    return NextResponse.json({
      message: 'Loyalty points added successfully',
      user: updatedUser,
      pointsAdded: parseInt(points),
      reason
    });

  } catch (error) {
    console.error('Loyalty POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getLoyaltyTierInfo(tier: string) {
  const tiers = {
    'Bronze': {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      benefits: ['Basic customer support', 'Standard processing times'],
      discount: 0,
      color: '#CD7F32'
    },
    'Silver': {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 2499,
      benefits: ['Priority customer support', 'Faster processing times', '5% discount on orders'],
      discount: 5,
      color: '#C0C0C0'
    },
    'Gold': {
      name: 'Gold',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: ['VIP customer support', 'Fastest processing times', '10% discount on orders', 'Priority queue placement'],
      discount: 10,
      color: '#FFD700'
    },
    'Platinum': {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: 9999,
      benefits: ['Concierge support', 'Instant processing', '15% discount on orders', 'Priority queue placement', 'Exclusive events access'],
      discount: 15,
      color: '#E5E4E2'
    },
    'Diamond': {
      name: 'Diamond',
      minPoints: 10000,
      maxPoints: 999999,
      benefits: ['Personal account manager', 'Instant processing', '20% discount on orders', 'Priority queue placement', 'Exclusive events access', 'Custom features'],
      discount: 20,
      color: '#B9F2FF'
    }
  };

  return tiers[tier as keyof typeof tiers] || tiers['Bronze'];
}

function getNextTier(currentTier: string) {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null;
  }

  const nextTier = tiers[currentIndex + 1];
  return {
    name: nextTier,
    ...getLoyaltyTierInfo(nextTier)
  };
}

function calculateLoyaltyTier(points: number): string {
  if (points >= 10000) return 'Diamond';
  if (points >= 5000) return 'Platinum';
  if (points >= 2500) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
}
