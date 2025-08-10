import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get pending notifications for teammates
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

    // Verify user is a pro teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true, isOnline: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    if (!user.isOnline) {
      return NextResponse.json({ error: 'Must be online to receive notifications' }, { status: 400 });
    }

    // Get pending queue entries for the teammate's game
    const teammate = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { game: true }
    });

    const pendingRequests = await prisma.queueEntry.findMany({
      where: {
        game: teammate?.game || undefined,
        status: 'waiting'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ pendingRequests });

  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Accept a queue request
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
    const { queueEntryId } = body;

    if (!queueEntryId) {
      return NextResponse.json({ error: 'Missing queue entry ID' }, { status: 400 });
    }

    // Get the queue entry
    const queueEntry = await prisma.queueEntry.findUnique({
      where: { id: queueEntryId },
      include: {
        user: {
          select: {
            username: true,
            rank: true
          }
        }
      }
    });

    if (!queueEntry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    if (queueEntry.status !== 'waiting') {
      return NextResponse.json({ error: 'Queue entry already processed' }, { status: 400 });
    }

    // Create a session
    const session = await prisma.session.create({
      data: {
        clientId: queueEntry.userId,
        proTeammateId: decoded.userId,
        game: queueEntry.game,
        mode: queueEntry.mode,
        status: 'Pending',
        startTime: new Date(),
        price: queueEntry.price,
        duration: queueEntry.duration
      },
      include: {
        client: {
          select: {
            username: true,
            rank: true
          }
        },
        proTeammate: {
          select: {
            username: true,
            rank: true
          }
        }
      }
    });

    // Update queue entry status
    await prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: 'matched' }
    });

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Request accepted successfully'
    });

  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 