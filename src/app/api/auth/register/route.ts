// @/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { generateToken, TokenPayload } from '@/lib/auth';
import csrfTokenHandler from '@/lib/csrfToken';
import { ApiError, errorHandler } from '@/lib/errors'; // Importujemy nasz system błędów

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be less than 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  game: z.string().optional(),
  role: z.string().optional(),
  // csrfToken jest teraz pobierany z nagłówka, nie z body
});

export async function POST(request: NextRequest) {
  try {
    // Weryfikacja tokenu CSRF z nagłówka
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken || !(await csrfTokenHandler.verify(csrfToken))) {
      throw new ApiError(403, 'Your session has expired. Please refresh the page and try again.');
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: validatedData.email }, 
          { username: validatedData.username }
        ] 
      }
    });

    if (existingUser) {
      // Sprawdzamy, które pole jest zduplikowane i zwracamy konkretny błąd
      if (existingUser.email === validatedData.email) {
        throw new ApiError(409, 'An account with this email address already exists.');
      }
      if (existingUser.username === validatedData.username) {
        throw new ApiError(409, 'This username is already taken. Please choose another.');
      }
    }
    
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const { user, token } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { ...validatedData, password: hashedPassword },
        select: { id: true, email: true, username: true }
      });

      const tokenPayload: TokenPayload = { userId: newUser.id, email: newUser.email, username: newUser.username };
      const generatedToken = generateToken(tokenPayload);

      await tx.authSession.create({
        data: {
          userId: newUser.id,
          token: generatedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        }
      });

      return { user: newUser, token: generatedToken };
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Redirecting...',
      user,
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    // Wszystkie błędy (ApiError, ZodError) są teraz obsługiwane przez centralny handler
    return errorHandler(error);
  }
}
