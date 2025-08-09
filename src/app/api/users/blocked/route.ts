import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/blocked - Get user's blocked users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    let blockedUsers;
    if (userType === 'customer') {
      // Get customer's blocked teammates
      blockedUsers = await prisma.blockedTeammate.findMany({
        where: { customerId: parseInt(userId) },
        include: {
          teammate: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              game: true
            }
          }
        }
      });
    } else if (userType === 'teammate') {
      // Get teammate's blocked customers
      blockedUsers = await prisma.blockedCustomer.findMany({
        where: { teammateId: parseInt(userId) },
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              game: true
            }
          }
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    console.error('Failed to fetch blocked users:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked users' }, { status: 500 });
  }
}

// POST /api/users/blocked - Block a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetUserId, userType } = body;

    if (!userId || !targetUserId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let blockedUser;
    if (userType === 'customer') {
      // Customer blocking a teammate
      blockedUser = await prisma.blockedTeammate.create({
        data: {
          customerId: parseInt(userId),
          teammateId: parseInt(targetUserId)
        }
      });
    } else if (userType === 'teammate') {
      // Teammate blocking a customer
      blockedUser = await prisma.blockedCustomer.create({
        data: {
          teammateId: parseInt(userId),
          customerId: parseInt(targetUserId)
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ blockedUser, message: 'User blocked successfully' });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User already blocked' }, { status: 409 });
    }
    console.error('Failed to block user:', error);
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
  }
}

// DELETE /api/users/blocked - Unblock a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetUserId = searchParams.get('targetUserId');
    const userType = searchParams.get('userType');

    if (!userId || !targetUserId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userType === 'customer') {
      // Customer unblocking a teammate
      await prisma.blockedTeammate.deleteMany({
        where: {
          customerId: parseInt(userId),
          teammateId: parseInt(targetUserId)
        }
      });
    } else if (userType === 'teammate') {
      // Teammate unblocking a customer
      await prisma.blockedCustomer.deleteMany({
        where: {
          teammateId: parseInt(userId),
          customerId: parseInt(targetUserId)
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Failed to unblock user:', error);
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
  }
}
