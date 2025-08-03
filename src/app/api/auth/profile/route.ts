// src/app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

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
  avatar: z.string().url().optional(),
});

// GET profile
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        isOnline: true,
        createdAt: true,
        lastSeen: true,
        _count: {
          select: {
            coachingSessions: true,
            reviews: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user stats
    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const userWithStats = {
      ...user,
      stats: {
        totalSessions: user._count.coachingSessions,
        totalReviews: user._count.reviews,
        averageRating: Math.round(averageRating * 10) / 10,
      }
    };

    return NextResponse.json({ user: userWithStats });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update profile
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if username is being changed and if it's already taken
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: decoded.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
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
        isOnline: true,
        createdAt: true,
        lastSeen: true,
        updatedAt: true,
      }
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

// src/app/api/auth/upload-avatar/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const data = await request.formData();
    const file: File | null = data.get('avatar') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `avatar_${decoded.userId}_${timestamp}.${extension}`;
    
    // Save file to public/uploads/avatars directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Update user avatar in database
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        username: true,
        avatar: true,
      }
    });

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}