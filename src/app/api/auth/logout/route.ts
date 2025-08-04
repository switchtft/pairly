// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        // Decode token to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

        // Delete session from database
        await prisma.authSession.deleteMany({
          where: { token: token }
        });

        // Update user online status
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { isOnline: false }
        });
      } catch (error) {
        console.error('Error during logout cleanup:', error);
      }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Clear the cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 