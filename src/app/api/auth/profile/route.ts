import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import csrfTokenHandler from '@/lib/csrfToken'; // Import the CSRF handler
import { verifyAuth } from '@/lib/auth';   // Import the new reusable auth helper

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
  avatar: z.string().optional(),
});

// Define a reusable Prisma select object to avoid repeating the same fields.
const userProfileSelect = {
  id: true, email: true, username: true, firstName: true, lastName: true, avatar: true,
  bio: true, game: true, role: true, rank: true, isPro: true, verified: true,
  discord: true, steam: true, timezone: true, languages: true, createdAt: true,
  lastSeen: true, isOnline: true,
};

// GET profile and a new CSRF token
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user using the shared helper function.
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { userId } = authResult.user;

    // 2. Fetch user data from the database.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect, // Use the reusable select object.
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Generate a new, single-use CSRF token for the client.
    const csrfToken = await csrfTokenHandler.generate(userId);

    // 4. Fetch additional user statistics.
    const [totalSessions, totalReviews, averageRating] = await Promise.all([
      prisma.session.count({ where: { OR: [{ clientId: user.id }, { proTeammateId: user.id }] } }),
      prisma.review.count({ where: { reviewedId: user.id } }),
      prisma.review.aggregate({ where: { reviewedId: user.id }, _avg: { rating: true } })
    ]);

    const userWithStats = {
      ...user,
      stats: {
        totalSessions,
        totalReviews,
        averageRating: averageRating._avg.rating || 0
      }
    };

    // 5. Return the combined user data and the CSRF token.
    return NextResponse.json({ user: userWithStats, csrfToken });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update profile with CSRF verification
export async function PUT(request: NextRequest) {
  try {
    // 1. Authenticate the user.
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { userId } = authResult.user;

    // 2. Verify the CSRF token from the request headers.
    const tokenFromClient = request.headers.get('X-CSRF-Token');
    if (!tokenFromClient) {
      return NextResponse.json({ error: 'CSRF token missing from headers' }, { status: 403 });
    }

    const isTokenValid = await csrfTokenHandler.verify(tokenFromClient, userId);
    if (!isTokenValid) {
      return NextResponse.json({ error: 'Invalid or expired CSRF token' }, { status: 403 });
    }

    // 3. If authentication and CSRF checks pass, proceed to update.
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: validatedData.username, id: { not: userId } }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: userProfileSelect, // Use the reusable select object.
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
