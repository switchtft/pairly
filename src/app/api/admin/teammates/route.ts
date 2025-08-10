import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface TeammateData {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  game: string | null;
  rank: string | null;
  isOnline: boolean;
  lastSeen: string;
  totalSessions: number;
  averageRating: number;
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
    const onlineOnly = searchParams.get('online') === 'true';
    const game = searchParams.get('game');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: Record<string, unknown> = {
      isPro: true,
    };
    
    if (onlineOnly) {
      whereClause.isOnline = true;
    }
    
    if (game) {
      whereClause.game = game;
    }

    const teammates = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        game: true,
        rank: true,
        isOnline: true,
        lastSeen: true,
        proSessions: {
          select: {
            id: true,
          },
        },
        reviewsReceived: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        lastSeen: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const teammatesData: TeammateData[] = teammates.map((teammate) => {
      const totalSessions = teammate.proSessions.length;
      const totalRating = teammate.reviewsReceived.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = teammate.reviewsReceived.length > 0 
        ? totalRating / teammate.reviewsReceived.length 
        : 0;

      return {
        id: teammate.id,
        username: teammate.username,
        email: teammate.email,
        firstName: teammate.firstName,
        lastName: teammate.lastName,
        avatar: teammate.avatar,
        game: teammate.game,
        rank: teammate.rank,
        isOnline: teammate.isOnline,
        lastSeen: teammate.lastSeen.toISOString(),
        totalSessions,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      };
    });

    const totalCount = await prisma.user.count({ where: whereClause });

    return NextResponse.json({
      teammates: teammatesData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching teammates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
