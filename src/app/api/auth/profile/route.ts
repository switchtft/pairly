// src/app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().min(3).max(20).optional(),
  bio: z.string().max(500).optional(),
  game: z.string().optional(),
  role: z.string().optional(),
  rank: z.string().optional(),
  discord: z.string().optional(),
  steam: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
  avatar: z.string().optional(), // Allow any string for avatar (URL or base64)
});

// GET profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        game: true,
        role: true,
        rank: true,
        isPro: true,
        verified: true,
        discord: true,
        steam: true,
        timezone: true,
        languages: true,
        createdAt: true,
        lastSeen: true,
        isOnline: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user stats
    const [totalSessions, totalReviews, averageRating] = await Promise.all([
      prisma.session.count({
        where: {
          OR: [
            { clientId: user.id },
            { proTeammateId: user.id }
          ]
        }
      }),
      prisma.review.count({
        where: { reviewedId: user.id }
      }),
      prisma.review.aggregate({
        where: { reviewedId: user.id },
        _avg: { rating: true }
      })
    ]);

    const userWithStats = {
      ...user,
      stats: {
        totalSessions,
        totalReviews,
        averageRating: averageRating._avg.rating || 0
      }
    };

    return NextResponse.json({ user: userWithStats });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update profile
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if username is being changed and if it's already taken
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: decoded.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        game: true,
        role: true,
        rank: true,
        isPro: true,
        verified: true,
        discord: true,
        steam: true,
        timezone: true,
        languages: true,
        createdAt: true,
        lastSeen: true,
      }
    });

    return NextResponse.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}