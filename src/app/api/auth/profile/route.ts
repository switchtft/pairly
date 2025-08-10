// src/app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  game?: string;
  rank?: string;
  hourlyRate?: number;
  avatar?: string;
  discord?: string;
  steam?: string;
  timezone?: string;
  languages?: string;
  availability?: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        rank: true,
        role: true,
        game: true,
        userType: true,
        isPro: true,
        isAdmin: true,
        isOnline: true,
        lastSeen: true,
        verified: true,
        bio: true,
        discord: true,
        steam: true,
        timezone: true,
        languages: true,
        hourlyRate: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user stats
    const stats = await prisma.$transaction([
      prisma.session.count({
        where: { clientId: user.id }
      }),
      prisma.session.count({
        where: { proTeammateId: user.id }
      }),
      prisma.payment.aggregate({
        where: { userId: user.id, status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.review.aggregate({
        where: { reviewedId: user.id },
        _avg: { rating: true },
        _count: true
      })
    ]);

    const [totalSessions, totalProSessions, totalSpent, reviews] = stats;

    const extendedUser = {
      ...user,
      stats: {
        totalSessions: totalSessions,
        totalProSessions: totalProSessions,
        totalSpent: totalSpent._sum.amount || 0,
        averageRating: reviews._avg.rating || 0,
        totalReviews: reviews._count || 0
      }
    };

    return NextResponse.json({ user: extendedUser });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body: ProfileUpdateRequest = await request.json();

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.game !== undefined && { game: body.game }),
        ...(body.rank !== undefined && { rank: body.rank }),
        ...(body.hourlyRate !== undefined && { hourlyRate: body.hourlyRate }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.discord !== undefined && { discord: body.discord }),
        ...(body.steam !== undefined && { steam: body.steam }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.languages !== undefined && { languages: body.languages }),
        ...(body.availability !== undefined && { availability: body.availability }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        game: true,
        rank: true,
        hourlyRate: true,
        avatar: true,
        discord: true,
        steam: true,
        timezone: true,
        languages: true,
        availability: true,
        userType: true,
        isPro: true,
        isAdmin: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}