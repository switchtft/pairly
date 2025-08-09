// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'  // Use the singleton

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    
    console.log('Fetching users with game filter:', game);
    
    const users = await prisma.user.findMany({
      where: {
        isPro: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users`);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}