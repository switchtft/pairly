/ src/app/api/auth/register/route.ts - Updated with cookies
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  game: z.string().optional(),
  role: z.string().optional(),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Registration attempt for email:', body.email);
    
    const validatedData = registerSchema.parse(body);

    // Check database connection first
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    console.log('Database connection OK, checking existing user...');

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { username: validatedData.username }
          ]
        }
      });
      console.log('Existing user check completed, user exists:', !!existingUser);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again.' },
        { status: 503 }
      );
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.email === validatedData.email ? 'email' : 'username');
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          game: validatedData.game,
          role: validatedData.role,
        },
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
      console.log('User created successfully:', user.email);
    } catch (createError) {
      console.error('User creation failed:', createError);
      return NextResponse.json(
        { error: 'Failed to create user. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Generating token...');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Try to create session if table exists
    try {
      await prisma.authSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      });
      console.log('Session created successfully');
    } catch (sessionError) {
      console.warn('Session creation failed (table might not exist):', sessionError);
      // Continue without session creation if table doesn't exist
    }

    console.log('Registration successful for user:', user.email);

    const response = NextResponse.json({ 
      message: 'User created successfully', 
      user,
      token
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Check if it's a database connection error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('connection') ||
        errorMessage.includes('database') ||
        errorMessage.includes('prisma') ||
        errorMessage.includes('postgres')
      ) {
        console.error('Database connection error:', error);
        return NextResponse.json(
          { error: 'Database connection issue. Please check if your database is running and try again.' },
          { status: 503 }
        );
      }
    }

    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}