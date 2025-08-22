// @/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import rateLimiter from '@/lib/rateLimiter';
import { generateToken, TokenPayload } from '@/lib/auth';
import csrfTokenHandler from '@/lib/csrfToken';
import { ApiError, errorHandler } from '@/lib/errors';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  timezone: z.string().optional(),
});


export async function POST(request: NextRequest) {
  try {
    const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
    
    // Rate Limiting
    const { isAllowed } = await rateLimiter.check(ip);
    if (!isAllowed) {
      throw new ApiError(429, 'Too many requests. Please wait a moment before trying again.');
    }

    // CSRF Token Verification
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken || !(await csrfTokenHandler.verify(csrfToken))) {
      // Bardziej przyjazny komunikat dla użytkownika
      throw new ApiError(403, 'Your session has expired. Please refresh the page and try again.');
    }

    // Input Validation
    const body = await request.json();
    const { email, password, timezone } = loginSchema.parse(body);

    // User Authentication
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Celowo ogólny komunikat dla bezpieczeństwa
      throw new ApiError(401, 'The email or password you entered is incorrect. Please check your credentials.');
    }
    
    if (user.accountLocked && user.lockUntil && new Date(user.lockUntil) > new Date()) {
      // Bardziej precyzyjny komunikat o blokadzie
      const minutesLeft = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / (1000 * 60));
      throw new ApiError(403, `This account is temporarily locked. Please try again in about ${minutesLeft} minutes.`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // await handleFailedLogin(email);
      // Ten sam ogólny komunikat, aby nie zdradzać, czy problemem jest hasło czy email
      throw new ApiError(401, 'The email or password you entered is incorrect. Please check your credentials.');
    }

    // Generowanie tokenu i transakcja (bez zmian)
    const tokenPayload: TokenPayload = { userId: user.id, email: user.email, username: user.username };
    const token = generateToken(tokenPayload);

    const [, updatedUser] = await prisma.$transaction([
        prisma.authSession.create({
            data: { userId: user.id, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        }),
        prisma.user.update({
            where: { id: user.id },
            data: {
                lastSeen: new Date(),
                accountLocked: false,
                lockUntil: null,
                timezone: user.timezone ?? timezone,
            }
        })
    ]);

    const { password: _, ...userToReturn } = updatedUser;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userToReturn,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    
    return response;

  } catch (error) {
    return errorHandler(error);
  }
}
