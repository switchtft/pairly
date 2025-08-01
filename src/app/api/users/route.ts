import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const onlineOnly = searchParams.get('onlineOnly') === 'true';
    
    const users = await prisma.user.findMany({
      where: {
        isPro: true, // Only get pro players
        ...(game && { game: game }),
      },
      select: {
        id: true,
        username: true,
        rank: true,
        game: true,
        role: true,
        isPro: true,
        createdAt: true,
        // Add any other fields you need
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}