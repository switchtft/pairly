// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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

export async function GET() {
  try {
    console.log('Getting user from me endpoint...');

    // Get token from cookies instead of Authorization header
    const cookieStore = await cookies();
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

    // Get user from the database
    let user;
    try {
      user = await prisma.user.findUnique({
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
        }
      });
      console.log('User query completed, user found:', !!user);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update last seen
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastSeen: new Date(),
        }
      });
      console.log('User last seen updated successfully');
    } catch (updateError) {
      console.warn('User update failed:', updateError);
      // Continue even if update fails
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
