// @/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import csrfTokenHandler from '@/lib/csrfToken';
import { verifyAuth } from '@/lib/auth';
import { ApiError, errorHandler } from '@/lib/errors'; // Importujemy nasz system błędów

// Ulepszony schemat z transformacją pustych stringów na undefined
const updateProfileSchema = z.object({
  firstName: z.string().optional().transform(val => val === "" ? undefined : val),
  lastName: z.string().optional().transform(val => val === "" ? undefined : val),
  username: z.string().min(3).max(20).optional(),
  bio: z.string().max(500).optional().transform(val => val === "" ? undefined : val),
  game: z.string().optional(),
  role: z.string().optional(),
  rank: z.string().optional(),
  discord: z.string().optional().transform(val => val === "" ? undefined : val),
  steam: z.string().optional().transform(val => val === "" ? undefined : val),
  timezone: z.string().optional(),
  languages: z.array(z.string()).optional(),
  avatar: z.string().optional(),
});

// Reużywalny obiekt select dla spójności danych
const userProfileSelect = {
  id: true, email: true, username: true, firstName: true, lastName: true, avatar: true,
  bio: true, game: true, role: true, rank: true, isPro: true, verified: true,
  discord: true, steam: true, timezone: true, languages: true, createdAt: true,
  lastSeen: true, isOnline: true,
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      // Używamy ApiError zamiast ręcznego tworzenia odpowiedzi
      throw new ApiError(authResult.status, authResult.error);
    }
    const { userId } = authResult.user;

    const [user, totalSessions, totalReviews, ratingAggregation] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: userProfileSelect,
      }),
      prisma.session.count({ where: { OR: [{ clientId: userId }, { proTeammateId: userId }] } }),
      prisma.review.count({ where: { reviewedId: userId } }),
      prisma.review.aggregate({ where: { reviewedId: userId }, _avg: { rating: true } })
    ]);

    if (!user) {
      throw new ApiError(404, 'User profile could not be found.');
    }
    
    const csrfToken = await csrfTokenHandler.generate();
    
    const userWithStats = {
      ...user,
      stats: {
        totalSessions,
        totalReviews,
        averageRating: ratingAggregation._avg.rating || 0
      }
    };

    return NextResponse.json({ user: userWithStats, csrfToken });
  } catch (error) {
    // Wszystkie błędy trafiają do naszego centralnego handlera
    return errorHandler(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      throw new ApiError(authResult.status, authResult.error);
    }
    const { userId } = authResult.user;

    const tokenFromClient = request.headers.get('X-CSRF-Token');
    if (!tokenFromClient || !(await csrfTokenHandler.verify(tokenFromClient))) {
        throw new ApiError(403, 'Your session has expired. Please refresh the page and try again.');
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: validatedData.username, id: { not: userId } }
      });
      if (existingUser) {
        throw new ApiError(409, 'This username is already taken. Please choose another.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: userProfileSelect,
    });

    return NextResponse.json({ 
        success: true, 
        message: 'Profile updated successfully!', 
        user: updatedUser 
    });
  } catch (error) {
    // errorHandler obsługuje już ZodError, więc upraszczamy blok catch
    return errorHandler(error);
  }
}
