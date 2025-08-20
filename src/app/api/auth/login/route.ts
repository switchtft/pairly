// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Login attempt for email:', body.email); // Debug log
    
    const { email, password } = loginSchema.parse(body);

    // Check database connection first
    const isDbConnected = await checkDatabaseConnection();
    if (!isDbConnected) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    console.log('Database connection OK, searching for user...');

    // Find user with error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          firstName: true,
          lastName: true,
          avatar: true,
          game: true,
          role: true,
          rank: true,
          isPro: true,
          verified: true,
        }
      });
      console.log('User query completed, user found:', !!user);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again.' },
        { status: 503 }
      );
    }

    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password valid, generating token...');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Token generated, updating database...');

    // Try to create session and update user
    try {
      // Create session in database (if authSession table exists)
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

      // Update last seen and online status
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            lastSeen: new Date(),
            // Only update isOnline if the column exists
          }
        });
        console.log('User updated successfully');
      } catch (updateError) {
        console.warn('User update failed:', updateError);
        // Continue even if update fails
      }
    } catch (error) {
      console.warn('Database updates failed, but continuing with login:', error);
      // Don't fail the login if database updates fail
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    console.log('Login successful for user:', user.email);

    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

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
        { error: 'Invalid input data', details: error.errors },
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

    console.error('Unexpected login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}