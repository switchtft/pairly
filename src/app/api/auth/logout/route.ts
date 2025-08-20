import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Logout request received');

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No token found, logout failed' }, { status: 400 });
    }

    try {
      // Decode token to get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };

      // Try to delete the session from the database
      try {
        await prisma.authSession.deleteMany({
          where: { token: token }
        });
        console.log('Session deleted from database');
      } catch (sessionError) {
        console.warn('Session deletion failed (table might not exist):', sessionError);
        // Continue even if session deletion fails
      }

      // Update user online status and last seen
      try {
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { 
            isOnline: false,
            lastSeen: new Date()
          }
        });
        console.log('User status updated to offline');
      } catch (updateError) {
        console.warn('User status update failed:', updateError);
        // Continue even if user update fails
      }
    } catch (jwtError) {
      console.warn('Token verification failed during logout:', jwtError);
      // Continue with logout even if token is invalid
    }

    // Create a response to confirm logout
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    console.log('Logout successful');
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie and return success
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response; // Respond with success even if there was an error
  }
}
