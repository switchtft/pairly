import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const saveDraftSchema = z.object({
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

export async function GET() {
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

    // Get user's current active post (if any)
    const activePost = await prisma.duoPost.findFirst({
      where: {
        authorId: decoded.userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Get user's saved draft (inactive post)
    const savedDraft = await prisma.duoPost.findFirst({
      where: {
        authorId: decoded.userId,
        isActive: false,
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      activePost,
      savedDraft,
    });
  } catch (error) {
    console.error('Error fetching user post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user post' },
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
    const validatedData = saveDraftSchema.parse(body);

    // Delete any existing draft
    await prisma.duoPost.deleteMany({
      where: {
        authorId: decoded.userId,
        isActive: false,
      },
    });

    // Create new draft (inactive post)
    const draft = await prisma.duoPost.create({
      data: {
        ...validatedData,
        authorId: decoded.userId,
        isActive: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year (draft doesn't expire)
        views: 0,
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const validatedData = saveDraftSchema.parse(body);

    // Find existing draft
    const existingDraft = await prisma.duoPost.findFirst({
      where: {
        authorId: decoded.userId,
        isActive: false,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: 'No draft found' },
        { status: 404 }
      );
    }

    // Update draft
    const draft = await prisma.duoPost.update({
      where: { id: existingDraft.id },
      data: validatedData,
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}
