import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { discordVoiceService } from '@/lib/discord-voice';
import prisma from '@/lib/prisma';

// GET - Get voice chat status and participants
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

    // Verify user has access to this session
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId }
        ]
      },
      include: {
        client: {
          select: { username: true }
        },
        proTeammate: {
          select: { username: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    // Get voice chat status
    const isActive = discordVoiceService.isSessionActive(parseInt(sessionId));
    const participants = discordVoiceService.getSessionParticipants(parseInt(sessionId));

    // Get user info for participants
    const participantUsers = await prisma.user.findMany({
      where: {
        id: { in: participants.map(p => parseInt(p)).filter(id => !isNaN(id)) }
      },
      select: {
        id: true,
        username: true,
        isOnline: true
      }
    });

    return NextResponse.json({
      sessionId: parseInt(sessionId),
      isActive,
      participants: participantUsers,
      sessionName: `${session.client.username} & ${session.proTeammate?.username || 'Teammate'}`
    });

  } catch (error) {
    console.error('Voice GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or join voice chat
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
    const { sessionId, action } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'Session ID and action required' }, { status: 400 });
    }

    // Verify user has access to this session
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId }
        ]
      },
      include: {
        client: {
          select: { username: true }
        },
        proTeammate: {
          select: { username: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    const sessionName = `${session.client.username} & ${session.proTeammate?.username || 'Teammate'}`;

    switch (action) {
      case 'create':
        // Create new voice channel
        const channelId = await discordVoiceService.createVoiceChannel(parseInt(sessionId), sessionName);
        if (!channelId) {
          return NextResponse.json({ error: 'Failed to create voice channel' }, { status: 500 });
        }

        // Generate invite link
        const inviteLink = await discordVoiceService.generateInviteLink(parseInt(sessionId));

        return NextResponse.json({
          success: true,
          channelId,
          inviteLink,
          message: 'Voice channel created successfully'
        });

      case 'join':
        // Join existing voice channel
        const joined = await discordVoiceService.joinVoiceChannel(parseInt(sessionId), decoded.userId.toString());
        if (!joined) {
          return NextResponse.json({ error: 'Failed to join voice channel' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Joined voice channel successfully'
        });

      case 'leave':
        // Leave voice channel
        const left = await discordVoiceService.leaveVoiceChannel(parseInt(sessionId), decoded.userId.toString());
        if (!left) {
          return NextResponse.json({ error: 'Failed to leave voice channel' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Left voice channel successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Voice POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete voice channel
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Verify user has access to this session
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(sessionId),
        OR: [
          { clientId: decoded.userId },
          { proTeammateId: decoded.userId }
        ]
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
    }

    // Delete voice channel
    const deleted = await discordVoiceService.deleteVoiceChannel(parseInt(sessionId));
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete voice channel' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Voice channel deleted successfully'
    });

  } catch (error) {
    console.error('Voice DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 