import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface ChatMessageRequest {
  sessionId: string;
  content: string;
  type?: string;
}

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
      where: { id: sessionId },
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
      where: { sessionId: sessionId },
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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body: ChatMessageRequest = await request.json();
    const { sessionId, content, type = 'text' } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: 'Session ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this session
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId },
        ],
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Create chat message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderId: decoded.userId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Message sent successfully',
      data: {
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        senderName: message.sender.username,
        senderAvatar: message.sender.avatar,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Chat message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 