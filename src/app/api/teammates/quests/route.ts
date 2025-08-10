import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get quests for teammate
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

    // Verify user is a pro teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Calculate teammate stats for quest progress
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklyOrders, totalOrders, reviews, totalEarnings] = await Promise.all([
      // Weekly orders
      prisma.session.count({
        where: {
          proTeammateId: decoded.userId,
          startTime: { gte: weekAgo },
          status: 'Completed'
        }
      }),
      // Total orders
      prisma.session.count({
        where: {
          proTeammateId: decoded.userId,
          status: 'Completed'
        }
      }),
      // Reviews
      prisma.review.findMany({
        where: { reviewedId: decoded.userId },
        select: { rating: true }
      }),
      // Total earnings
      prisma.session.aggregate({
        where: {
          proTeammateId: decoded.userId,
          status: 'Completed'
        },
        _sum: { price: true }
      })
    ]);

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Generate quests based on teammate stats
    const quests = [
      {
        id: 1,
        title: 'Complete 10 Orders',
        description: 'Complete 10 orders this week',
        reward: 50,
        progress: Math.min(weeklyOrders, 10),
        maxProgress: 10,
        status: weeklyOrders >= 10 ? 'completed' : weeklyOrders > 0 ? 'active' : 'locked',
        type: 'orders' as const
      },
      {
        id: 2,
        title: 'Maintain 4.5+ Rating',
        description: 'Keep average rating above 4.5 for 7 days',
        reward: 100,
        progress: averageRating >= 4.5 ? 1 : 0,
        maxProgress: 1,
        status: averageRating >= 4.5 ? 'completed' : averageRating > 0 ? 'active' : 'locked',
        type: 'rating' as const
      },
      {
        id: 3,
        title: 'Win Streak',
        description: 'Win 5 consecutive games',
        reward: 75,
        progress: Math.min(Math.floor(Math.random() * 6), 5), // Placeholder - would need actual streak tracking
        maxProgress: 5,
        status: 'active',
        type: 'streak' as const
      },
      {
        id: 4,
        title: 'Earn $100',
        description: 'Earn $100 in total from completed orders',
        reward: 150,
        progress: Math.min(totalEarnings._sum.price || 0, 100),
        maxProgress: 100,
        status: (totalEarnings._sum.price || 0) >= 100 ? 'completed' : (totalEarnings._sum.price || 0) > 0 ? 'active' : 'locked',
        type: 'earnings' as const
      },
      {
        id: 5,
        title: 'Complete 50 Total Orders',
        description: 'Complete 50 orders total',
        reward: 200,
        progress: Math.min(totalOrders, 50),
        maxProgress: 50,
        status: totalOrders >= 50 ? 'completed' : totalOrders > 0 ? 'active' : 'locked',
        type: 'orders' as const
      },
      {
        id: 6,
        title: 'Perfect Week',
        description: 'Complete 15 orders with 5.0 average rating',
        reward: 300,
        progress: weeklyOrders >= 15 && averageRating >= 5.0 ? 1 : 0,
        maxProgress: 1,
        status: weeklyOrders >= 15 && averageRating >= 5.0 ? 'completed' : 'locked',
        type: 'rating' as const
      }
    ];

    return NextResponse.json({ quests });

  } catch (error) {
    console.error('Quests GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
