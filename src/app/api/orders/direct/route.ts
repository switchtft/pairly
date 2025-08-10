import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Create a direct order to a favourite teammate
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
    const { teammateId, game, mode, duration, price } = body;

    if (!teammateId || !game || !mode || !duration || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the teammate exists and is a pro user
    const teammate = await prisma.user.findUnique({
      where: { id: teammateId, isPro: true }
    });

    if (!teammate) {
      return NextResponse.json({ error: 'Teammate not found' }, { status: 404 });
    }

    // Check if teammate is online
    if (!teammate.isOnline) {
      return NextResponse.json({ error: 'Teammate is currently offline' }, { status: 400 });
    }

    // Check if teammate is already in an active session
    const activeSession = await prisma.session.findFirst({
      where: {
        proTeammateId: teammateId,
        status: {
          in: ['Pending', 'Active']
        }
      }
    });

    if (activeSession) {
      return NextResponse.json({ error: 'Teammate is currently in a session' }, { status: 400 });
    }

    // Check if user has blocked this teammate
    const isBlocked = await prisma.userBlock.findUnique({
      where: {
        userId_blockedId: {
          userId: decoded.userId,
          blockedId: teammateId
        }
      }
    });

    if (isBlocked) {
      return NextResponse.json({ error: 'Cannot order from blocked teammate' }, { status: 400 });
    }

    // Check if teammate has blocked this user
    const isBlockedByTeammate = await prisma.userBlock.findUnique({
      where: {
        userId_blockedId: {
          userId: teammateId,
          blockedId: decoded.userId
        }
      }
    });

    if (isBlockedByTeammate) {
      return NextResponse.json({ error: 'Teammate has blocked you' }, { status: 400 });
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        clientId: decoded.userId,
        proTeammateId: teammateId,
        game,
        mode,
        status: 'Pending',
        startTime: new Date(),
        price,
        duration
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
        },
        proTeammate: {
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
      message: 'Direct order created successfully',
      session 
    });

  } catch (error) {
    console.error('Direct order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
