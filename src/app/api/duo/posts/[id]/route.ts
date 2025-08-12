import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updatePostSchema = z.object({
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const post = await prisma.duoPost.findFirst({
      where: {
        id: postId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.duoPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const postId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.duoPost.findFirst({
      where: {
        id: postId,
        authorId: decoded.userId,
        isActive: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found or not authorized' },
        { status: 404 }
      );
    }

    // Validate input
    const validatedData = updatePostSchema.parse(body);

    // Update post
    const post = await prisma.duoPost.update({
      where: { id: postId },
      data: validatedData,
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

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Check if user is admin or post owner
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    const post = await prisma.duoPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Allow deletion if user is admin or post owner
    if (user?.role !== 'administrator' && post.authorId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    await prisma.duoPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
