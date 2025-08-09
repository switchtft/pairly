// src/app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, bio, discord, steam, timezone, languages, hourlyRate, availability } = body;

    // Validate user type permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { userType: true, isAdmin: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only teammates can set hourlyRate and availability
    if ((hourlyRate !== undefined || availability !== undefined) && currentUser.userType !== 'teammate' && !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Only teammates can set hourly rate and availability' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        firstName,
        lastName,
        bio,
        discord,
        steam,
        timezone,
        languages,
        ...(currentUser.userType === 'teammate' || currentUser.isAdmin ? { hourlyRate, availability } : {}),
        updatedAt: new Date()
      },
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

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}