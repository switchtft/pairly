import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get user's blocked teammates
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

    const blocks = await prisma.userBlock.findMany({
      where: { userId: decoded.userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rank: true,
            role: true,
            game: true,
            isPro: true,
            verified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ blocks });

  } catch (error) {
    console.error('Blocks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Block a teammate
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
    const { teammateId } = body;

    if (!teammateId) {
      return NextResponse.json({ error: 'Teammate ID required' }, { status: 400 });
    }

    // Verify the teammate exists and is a pro user
    const teammate = await prisma.user.findUnique({
      where: { id: teammateId, isPro: true }
    });

    if (!teammate) {
      return NextResponse.json({ error: 'Teammate not found' }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.userBlock.findUnique({
      where: {
        userId_blockedId: {
          userId: decoded.userId,
          blockedId: teammateId
        }
      }
    });

    if (existingBlock) {
      return NextResponse.json({ error: 'Already blocked' }, { status: 400 });
    }

    // Add to blocks
    const block = await prisma.userBlock.create({
      data: {
        userId: decoded.userId,
        blockedId: teammateId
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rank: true,
            role: true,
            game: true,
            isPro: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Teammate blocked',
      block 
    });

  } catch (error) {
    console.error('Blocks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unblock a teammate
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

    const { searchParams } = new URL(request.url);
    const teammateId = searchParams.get('teammateId');

    if (!teammateId) {
      return NextResponse.json({ error: 'Teammate ID required' }, { status: 400 });
    }

    // Remove from blocks
    await prisma.userBlock.deleteMany({
      where: {
        userId: decoded.userId,
        blockedId: parseInt(teammateId)
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Teammate unblocked' 
    });

  } catch (error) {
    console.error('Blocks DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
