import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth'; // Import the reusable auth helper

export async function GET(request: NextRequest) {
  try {
    // 1. Use the single auth helper to verify the user's session.
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { userId } = authResult.user;

    // 2. Get user from the database.
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Update last seen status (non-critical).
    // This is wrapped in a promise that we don't await, so it doesn't block the response.
    prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeen: new Date(),
      }
    }).catch(updateError => {
      // Log the error but don't fail the request.
      console.warn('Failed to update last seen for user:', user.id, updateError);
    });

    return NextResponse.json({ user });

  } catch (error) {
    // This will catch any unexpected errors, like a database connection failure.
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
