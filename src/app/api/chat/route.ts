import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get chat messages for a session
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
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

    // Get chat messages
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: parseInt(sessionId) },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a message
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
    const { sessionId, content } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Session ID and content required' }, { status: 400 });
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

    if (session.status === 'Completed' || session.status === 'Cancelled') {
      return NextResponse.json({ error: 'Session is no longer active' }, { status: 400 });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: parseInt(sessionId),
        senderId: decoded.userId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 