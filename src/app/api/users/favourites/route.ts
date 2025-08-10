import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get user's favourite teammates
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const favourites = await prisma.userFavourite.findMany({
      where: { userId: decoded.userId },
      include: {
        favourite: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rank: true,
            role: true,
            game: true,
            isPro: true,
            verified: true,
            reviewsReceived: {
              select: { rating: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating for each favourite
    const favouritesWithRating = favourites.map(fav => ({
      ...fav,
      favourite: {
        ...fav.favourite,
        averageRating: fav.favourite.reviewsReceived.length > 0
          ? fav.favourite.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / fav.favourite.reviewsReceived.length
          : 0,
        totalReviews: fav.favourite.reviewsReceived.length
      }
    }));

    return NextResponse.json({ favourites: favouritesWithRating });

  } catch (error) {
    console.error('Favourites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a teammate to favourites
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { teammateId } = body;

    if (!teammateId) {
      return NextResponse.json({ error: 'Teammate ID required' }, { status: 400 });
    }

    // Verify the teammate exists and is a pro user
    const teammate = await prisma.user.findUnique({
      where: { id: teammateId, isPro: true }
    });

    if (!teammate) {
      return NextResponse.json({ error: 'Teammate not found' }, { status: 404 });
    }

    // Check if already favourited
    const existingFavourite = await prisma.userFavourite.findUnique({
      where: {
        userId_favouriteId: {
          userId: decoded.userId,
          favouriteId: teammateId
        }
      }
    });

    if (existingFavourite) {
      return NextResponse.json({ error: 'Already favourited' }, { status: 400 });
    }

    // Add to favourites
    const favourite = await prisma.userFavourite.create({
      data: {
        userId: decoded.userId,
        favouriteId: teammateId
      },
      include: {
        favourite: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            rank: true,
            role: true,
            game: true,
            isPro: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Added to favourites',
      favourite 
    });

  } catch (error) {
    console.error('Favourites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a teammate from favourites
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teammateId = searchParams.get('teammateId');

    if (!teammateId) {
      return NextResponse.json({ error: 'Teammate ID required' }, { status: 400 });
    }

    // Remove from favourites
    await prisma.userFavourite.deleteMany({
      where: {
        userId: decoded.userId,
        favouriteId: parseInt(teammateId)
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Removed from favourites' 
    });

  } catch (error) {
    console.error('Favourites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
