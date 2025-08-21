import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import rateLimiter from '@/lib/rateLimiter';
import { generateToken, TokenPayload } from '@/lib/auth'; // Import the shared token generator

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Account lockout mechanism
async function lockAccount(email: string) {
  await prisma.user.update({
    where: { email },
    data: {
      accountLocked: true,
      lockUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
    },
  });
}

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
  const { isAllowed, remaining, resetTime } = await rateLimiter.check(ip);

  const headers = new Headers();
  headers.set('X-RateLimit-Limit', String(100));
  headers.set('X-RateLimit-Remaining', String(remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime.getTime() / 1000)));

  if (!isAllowed) {
    const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    headers.set('Retry-After', String(retryAfter));
    return new NextResponse(JSON.stringify({ error: 'Too many requests from this IP, please try again later.' }), {
      status: 429,
      headers,
    });
  }
  // --- End Rate Limiting ---

  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again.' },
        { status: 503, headers }
      );
    }

    const foundUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        isPro: true,
        verified: true,
        accountLocked: true,
        lockUntil: true,
      }
    });

    if (!foundUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }

    if (foundUser.accountLocked && foundUser.lockUntil && new Date(foundUser.lockUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Account locked. Please try again later.' },
        { status: 403, headers }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      await lockAccount(email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }

    // --- ADAPTATION: Use the shared token generator ---
    const tokenPayload: TokenPayload = {
      userId: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
    };
    const token = generateToken(tokenPayload);

    await Promise.all([
      prisma.authSession.create({
        data: {
          userId: foundUser.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day, matching the token
        }
      }),
      prisma.user.update({
        where: { id: foundUser.id },
        data: { lastSeen: new Date(), accountLocked: false, lockUntil: null },
      })
    ]).catch(dbError => {
      console.warn('Session creation or user update failed:', dbError);
    });

    const { password: _password, ...userWithoutPassword } = foundUser;

    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    }, { headers });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 1 day, matching the token
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400, headers }
      );
    }
    console.error('Unexpected login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers }
    );
  }
}
