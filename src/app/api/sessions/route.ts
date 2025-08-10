import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get user's sessions (both as client and teammate)
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
    const status = searchParams.get('status'); // 'active', 'completed', 'all'

    // Build where clause
    const whereClause: any = {
      OR: [
        { clientId: decoded.userId },
        { proTeammateId: decoded.userId }
      ]
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        whereClause.status = { in: ['Pending', 'Active'] };
      } else if (status === 'completed') {
        whereClause.status = { in: ['Completed', 'Cancelled'] };
      }
    }

    // Get sessions
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        },
        proTeammate: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Sessions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update session status
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

    const body = await request.json();
    const { sessionId, status, endTime } = body;

    if (!sessionId || !status) {
      return NextResponse.json({ error: 'Session ID and status required' }, { status: 400 });
    }

    // Verify user is part of this session
    const session = await prisma.session.findUnique({
      where: { id: parseInt(sessionId) },
      select: {
        clientId: true,
        proTeammateId: true,
        status: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.clientId !== decoded.userId && session.proTeammateId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized for this session' }, { status: 403 });
    }

    // Update session
    const updateData: any = { status };
    if (endTime) {
      updateData.endTime = new Date(endTime);
    }

    const updatedSession = await prisma.session.update({
      where: { id: parseInt(sessionId) },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        },
        proTeammate: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Session updated successfully', 
      session: updatedSession 
    });

  } catch (error) {
    console.error('Sessions PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
