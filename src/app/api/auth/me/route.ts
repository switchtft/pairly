// @/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { ApiError, errorHandler } from '@/lib/errors'; // Importujemy nasz system błędów

export async function GET(request: NextRequest) {
  try {
    // Weryfikacja autentyczności użytkownika
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      // POPRAWKA: Dodano domyślny komunikat błędu, jeśli authResult.error jest undefined
      throw new ApiError(authResult.status || 401, authResult.error || 'Authentication failed.');
    }
    const { userId } = authResult.user;

    // Pobranie danych użytkownika
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
      throw new ApiError(404, 'User associated with this session was not found.');
    }

    // Aktualizacja ostatniej aktywności w tle (fire-and-forget)
    prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() }
    }).catch(updateError => {
      // Logujemy błąd, ale nie przerywamy żądania, bo nie jest to krytyczne
      console.warn(`Non-critical error: Failed to update last seen for user: ${user.id}`, updateError);
    });

    return NextResponse.json({ user });

  } catch (error) {
    // Wszystkie błędy są teraz obsługiwane przez nasz centralny handler
    return errorHandler(error);
  }
}
