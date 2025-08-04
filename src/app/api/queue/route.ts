import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get current queue status and available teammates
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

    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'valorant';

    // Get available teammates (pro users who are online and not in a session)
    const availableTeammates = await prisma.user.findMany({
      where: {
        isPro: true,
        isOnline: true,
        game: game,
        // Not currently in an active session
        proSessions: {
          none: {
            status: {
              in: ['Pending', 'Active']
            }
          }
        }
      },
      select: {
        id: true,
        username: true,
        rank: true,
        role: true,
        game: true,
        verified: true,
        lastSeen: true,
        reviewsReceived: {
          select: {
            rating: true
          }
        }
      }
    });

    // Get current queue for this game
    const queueEntries = await prisma.queueEntry.findMany({
      where: {
        game: game,
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

    return NextResponse.json({
      availableTeammates: availableTeammates.map(teammate => ({
        ...teammate,
        averageRating: teammate.reviewsReceived.length > 0 
          ? teammate.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / teammate.reviewsReceived.length
          : 0
      })),
      queueLength: queueEntries.length,
      estimatedWaitTime: queueEntries.length * 2 // Rough estimate: 2 minutes per person in queue
    });

  } catch (error) {
    console.error('Queue GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Join the queue
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
    const { game, duration, price, mode = 'duo' } = body;

    if (!game || !duration || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already in queue
    const existingEntry = await prisma.queueEntry.findFirst({
      where: {
        userId: decoded.userId,
        status: 'waiting'
      }
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'Already in queue' }, { status: 400 });
    }

    // Create queue entry
    const queueEntry = await prisma.queueEntry.create({
      data: {
        userId: decoded.userId,
        game,
        duration,
        price,
        mode,
        status: 'waiting'
      },
      include: {
        user: {
          select: {
            username: true,
            rank: true
          }
        }
      }
    });

    // Try to find a match immediately
    const match = await findMatch(queueEntry);
    if (match) {
      return NextResponse.json({ 
        success: true, 
        matchFound: true, 
        sessionId: match.id,
        teammate: match.proTeammate
      });
    }

    return NextResponse.json({ 
      success: true, 
      matchFound: false, 
      queueEntry: queueEntry.id,
      estimatedWaitTime: 5 // 5 minutes estimate
    });

  } catch (error) {
    console.error('Queue POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Leave the queue
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

    // Remove user from queue
    await prisma.queueEntry.deleteMany({
      where: {
        userId: decoded.userId,
        status: 'waiting'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Queue DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to find a match
async function findMatch(queueEntry: any) {
  // Find available teammates
  const availableTeammates = await prisma.user.findMany({
    where: {
      isPro: true,
      isOnline: true,
      game: queueEntry.game,
      proSessions: {
        none: {
          status: {
            in: ['Pending', 'Active']
          }
        }
      }
    },
    take: 1
  });

  if (availableTeammates.length === 0) {
    return null;
  }

  const teammate = availableTeammates[0];

  // Create a session
  const session = await prisma.session.create({
    data: {
      clientId: queueEntry.userId,
      proTeammateId: teammate.id,
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

  // Remove from queue
  await prisma.queueEntry.delete({
    where: { id: queueEntry.id }
  });

  return session;
} 