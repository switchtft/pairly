import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    let favorites;
    if (userType === 'customer') {
      // Get customer's favorite teammates
      favorites = await prisma.favoriteTeammate.findMany({
        where: { customerId: parseInt(userId) },
        include: {
          teammate: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              game: true,
              rating: true,
              hourlyRate: true
            }
          }
        }
      });
    } else if (userType === 'teammate') {
      // Get teammate's favorite customers
      favorites = await prisma.favoriteCustomer.findMany({
        where: { teammateId: parseInt(userId) },
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              game: true
            }
          }
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/users/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetUserId, userType } = body;

    if (!userId || !targetUserId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let favorite;
    if (userType === 'customer') {
      // Customer adding a teammate to favorites
      favorite = await prisma.favoriteTeammate.create({
        data: {
          customerId: parseInt(userId),
          teammateId: parseInt(targetUserId)
        }
      });
    } else if (userType === 'teammate') {
      // Teammate adding a customer to favorites
      favorite = await prisma.favoriteCustomer.create({
        data: {
          teammateId: parseInt(userId),
          customerId: parseInt(targetUserId)
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ favorite, message: 'Added to favorites' });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }
    console.error('Failed to add favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

// DELETE /api/users/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetUserId = searchParams.get('targetUserId');
    const userType = searchParams.get('userType');

    if (!userId || !targetUserId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userType === 'customer') {
      // Customer removing a teammate from favorites
      await prisma.favoriteTeammate.deleteMany({
        where: {
          customerId: parseInt(userId),
          teammateId: parseInt(targetUserId)
        }
      });
    } else if (userType === 'teammate') {
      // Teammate removing a customer from favorites
      await prisma.favoriteCustomer.deleteMany({
        where: {
          teammateId: parseInt(userId),
          customerId: parseInt(targetUserId)
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
