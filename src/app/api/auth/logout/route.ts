import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import csrfTokenHandler from '@/lib/csrfToken'; // Dodano import

/**
 * Handles the POST request for user logout.
 * This route verifies the user's session, deletes their session token from the database,
 * updates their online status, and clears the authentication cookie.
 */
export async function POST(request: NextRequest) {
  try {
    // Sprawdź poprawność tokena CSRF przed wykonaniem jakiejkolwiek operacji
    const tokenFromClient = request.headers.get('X-CSRF-Token');
    if (!tokenFromClient || !(await csrfTokenHandler.verify(tokenFromClient))) {
        return NextResponse.json({ error: 'Invalid or expired CSRF token.' }, { status: 403 });
    }

    // Verify the user's authentication token from the request headers.
    const authResult = await verifyAuth(request);

    // Get the token directly from the incoming request's cookies.
    // This avoids the "sync-dynamic-apis" error.
    const token = request.cookies.get('token')?.value;

    // Proceed with database cleanup only if a user and token are verified.
    if (authResult.user && token) {
      const { userId } = authResult.user;

      // Attempt to delete the specific session token from the database.
      try {
        await prisma.authSession.deleteMany({
          where: { token: token },
        });
      } catch (dbError) {
        // Log the error for debugging but continue the process.
        console.warn('Error deleting auth session during logout:', dbError);
      }

      // Attempt to update the user's status to offline.
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        });
      } catch (dbError) {
        console.warn('Error updating user status during logout:', dbError);
      }
    }

    // Always ensure the authentication cookie is cleared on the client side.
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Setting maxAge to 0 immediately expires the cookie
      path: '/',
    });

    return response;
  } catch (error) {
    // This catch block handles any unexpected, critical errors during the process.
    console.error('Unexpected logout error:', error);
    
    // In case of an unexpected error, still make sure to clear the client's cookie.
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
