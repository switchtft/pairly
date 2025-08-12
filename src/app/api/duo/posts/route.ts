import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createPostSchema = z.object({
  gameId: z.number().int().positive(),
  inGameName: z.string().min(1).max(50),
  rank: z.string().min(1).max(50),
  roles: z.array(z.string()).min(1).max(5),
  lookingFor: z.array(z.string()).min(1).max(5),
  champions: z.array(z.string()).min(1).max(3),
  message: z.string().max(500).optional(),
  discord: z.string().max(50).optional(),
  showDiscord: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: {
      isActive: boolean;
      expiresAt: { gt: Date };
      gameId?: number;
    } = {
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    };

    if (gameId) {
      where.gameId = parseInt(gameId);
    }

    const [posts, total] = await Promise.all([
      prisma.duoPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.duoPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    const body = await request.json();

    // Validate input
    const validatedData = createPostSchema.parse(body);

    // Check if user already has an active post and delete it
    await prisma.duoPost.deleteMany({
      where: {
        authorId: decoded.userId,
        isActive: true,
      },
    });

    // Create new post with 12-hour expiration
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

    const post = await prisma.duoPost.create({
      data: {
        ...validatedData,
        authorId: decoded.userId,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
