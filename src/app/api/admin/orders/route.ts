import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface OrderData {
  id: number;
  game: string;
  mode: string;
  status: string;
  price: number;
  duration: number;
  createdAt: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  teammate?: {
    id: number;
    username: string;
    email: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const game = searchParams.get('game');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: Record<string, unknown> = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (game) {
      whereClause.game = game;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        proTeammate: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const orders: OrderData[] = sessions.map((session: {
      id: number;
      game: string;
      mode: string;
      status: string;
      price: number;
      duration: number | null;
      createdAt: Date;
      client: {
        id: number;
        username: string;
        email: string;
      };
      proTeammate: {
        id: number;
        username: string;
        email: string;
      } | null;
    }) => ({
      id: session.id,
      game: session.game,
      mode: session.mode,
      status: session.status,
      price: session.price,
      duration: session.duration || 0,
      createdAt: session.createdAt.toISOString(),
      client: {
        id: session.client.id,
        username: session.client.username,
        email: session.client.email,
      },
      teammate: session.proTeammate ? {
        id: session.proTeammate.id,
        username: session.proTeammate.username,
        email: session.proTeammate.email,
      } : undefined,
    }));

    const totalCount = await prisma.session.count({ where: whereClause });

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
