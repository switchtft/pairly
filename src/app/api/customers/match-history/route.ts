import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const game = searchParams.get('game');
    const status = searchParams.get('status');

    // Build where clause
    const whereClause: {
      clientId: number;
      game?: string;
      status?: string;
    } = {
      clientId: decoded.userId,
    };
    
    if (game) {
      whereClause.game = game;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Get match history with pagination
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        proTeammate: {
          select: {
            id: true,
            username: true,
            avatar: true,
            game: true,
            rank: true,
            hourlyRate: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const totalSessions = await prisma.session.count({
      where: whereClause,
    });

    // Format sessions
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      game: session.game,
      mode: session.mode,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      price: session.price,
      duration: session.duration,
      teammate: session.proTeammate ? {
        id: session.proTeammate.id,
        username: session.proTeammate.username,
        avatar: session.proTeammate.avatar,
        game: session.proTeammate.game,
        rank: session.proTeammate.rank,
        hourlyRate: session.proTeammate.hourlyRate,
      } : null,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      pagination: {
        page,
        limit,
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limit),
      },
    });
  } catch (error) {
    console.error('Match history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
