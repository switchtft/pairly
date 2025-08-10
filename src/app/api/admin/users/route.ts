import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: string | null;
  game: string | null;
  rank: string | null;
  isPro: boolean;
  isOnline: boolean;
  verified: boolean;
  createdAt: string;
  lastSeen: string;
  totalSessions: number;
  totalReviews: number;
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
    const role = searchParams.get('role');
    const game = searchParams.get('game');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: Record<string, unknown> = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (game) {
      whereClause.game = game;
    }
    
    if (verified !== null) {
      whereClause.verified = verified === 'true';
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        game: true,
        rank: true,
        isPro: true,
        isOnline: true,
        verified: true,
        createdAt: true,
        lastSeen: true,
        clientSessions: {
          select: {
            id: true,
          },
        },
        proSessions: {
          select: {
            id: true,
          },
        },
        reviewsGiven: {
          select: {
            id: true,
          },
        },
        reviewsReceived: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const usersData: UserData[] = users.map((user) => {
      const totalSessions = user.clientSessions.length + user.proSessions.length;
      const totalReviews = user.reviewsGiven.length + user.reviewsReceived.length;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        game: user.game,
        rank: user.rank,
        isPro: user.isPro,
        isOnline: user.isOnline,
        verified: user.verified,
        createdAt: user.createdAt.toISOString(),
        lastSeen: user.lastSeen.toISOString(),
        totalSessions,
        totalReviews,
      };
    });

    const totalCount = await prisma.user.count({ where: whereClause });

    return NextResponse.json({
      users: usersData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    });

    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (admin.role !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, updates } = body as {
      userId: number;
      updates: {
        role?: string;
        verified?: boolean;
        isPro?: boolean;
      };
    };

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent admin from modifying themselves
    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot modify own account' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        verified: true,
        isPro: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
