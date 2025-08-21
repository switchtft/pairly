import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth'; // Import the reusable auth helper

export async function POST(request: NextRequest) {
  try {
    // Use the auth helper to securely get the user ID
    const authResult = await verifyAuth(request);
    
    // FIX: Added 'await' before cookies() to resolve the error
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (authResult.user && token) {
      const { userId } = authResult.user;
      // Perform cleanup tasks in parallel for better performance
      await Promise.all([
        // Delete the specific session token from the database
        prisma.authSession.deleteMany({
          where: { token: token }
        }),
        // Update the user's status to offline
        prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastSeen: new Date()
          }
        })
      ]).catch(dbError => {
        // Log any errors but don't block the logout process
        console.warn('Error during logout database cleanup:', dbError);
      });
    }

    // Always ensure the cookie is cleared, even if the user was not authenticated
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Unexpected logout error:', error);
    // In case of a critical error, still attempt to clear the cookie
    const response = NextResponse.json({ message: 'Logout completed despite an error' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  }
}
