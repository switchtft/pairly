
// src/app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  game: z.string().optional(),
  role: z.string().optional(),
  rank: z.string().optional(),
  discord: z.string().optional(),
  steam: z.string().optional(),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Profile update request received');

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check database connection first
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number; email: string };
      console.log('Token verified for user ID:', decoded.userId);
    } catch (jwtError) {
      console.error('Token verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updateData = updateProfileSchema.parse(body);

    console.log('Updating user profile...');

    let user;
    try {
      user = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...updateData,
          lastSeen: new Date(), // Update last seen on profile update
        },
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
      console.log('User profile updated successfully');
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to update profile. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Check if it's a database connection error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('connection') ||
        errorMessage.includes('database') ||
        errorMessage.includes('prisma') ||
        errorMessage.includes('postgres')
      ) {
        console.error('Database connection error:', error);
        return NextResponse.json(
          { error: 'Database connection issue. Please check if your database is running and try again.' },
          { status: 503 }
        );
      }
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Update failed' },
      { status: 500 }
    );
  }
}