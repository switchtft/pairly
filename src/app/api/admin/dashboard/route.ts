import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get admin dashboard data
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

    // Verify user is an admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    // Get real-time platform statistics
    const [
      totalUsers,
      totalTeammates,
      totalCustomers,
      onlineTeammates,
      activeSessions,
      pendingOrders,
      totalRevenue,
      todayRevenue
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'teammate' } }),
      prisma.user.count({ where: { userType: 'customer' } }),
      prisma.user.count({ where: { isOnline: true, userType: 'teammate' } }),
      prisma.session.count({ where: { status: { in: ['Pending', 'Active'] } } }),
      prisma.queueEntry.count({ where: { status: 'waiting', paymentStatus: 'paid' } }),
      prisma.payment.aggregate({
        where: { status: 'completed', method: { not: 'payout' } },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'completed', 
          method: { not: 'payout' },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        },
        _sum: { amount: true }
      })
    ]);

    // Get recent orders
    const recentOrders = await prisma.queueEntry.findMany({
      where: { status: 'waiting', paymentStatus: 'paid' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      where: { status: { in: ['Pending', 'Active'] } },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        proTeammate: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 10
    });

    // Get online teammates with details
    const onlineTeammatesList = await prisma.user.findMany({
      where: { 
        isOnline: true, 
        userType: 'teammate' 
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        game: true,
        lastSeen: true,
        hourlyRate: true
      },
      orderBy: { lastSeen: 'desc' }
    });

    // Get platform activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyStats = await prisma.$transaction([
      prisma.session.count({
        where: { startTime: { gte: sevenDaysAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'completed', 
          method: { not: 'payout' },
          createdAt: { gte: sevenDaysAgo }
        },
        _sum: { amount: true }
      })
    ]);

    const [weeklySessions, weeklyNewUsers, weeklyRevenue] = weeklyStats;

    return NextResponse.json({
      platformStats: {
        totalUsers,
        totalTeammates,
        totalCustomers,
        onlineTeammates,
        activeSessions,
        pendingOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0
      },
      weeklyStats: {
        sessions: weeklySessions,
        newUsers: weeklyNewUsers,
        revenue: weeklyRevenue._sum.amount || 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customerName: order.user.username,
        customerAvatar: order.user.avatar,
        game: order.game,
        gameMode: order.gameMode,
        price: order.totalPrice,
        createdAt: order.createdAt
      })),
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        customerName: session.client.username,
        customerAvatar: session.client.avatar,
        teammateName: session.proTeammate?.username || 'Unassigned',
        teammateAvatar: session.proTeammate?.avatar,
        game: session.game,
        status: session.status,
        startTime: session.startTime
      })),
      onlineTeammates: onlineTeammatesList.map(teammate => ({
        id: teammate.id,
        username: teammate.username,
        name: `${teammate.firstName || ''} ${teammate.lastName || ''}`.trim() || teammate.username,
        avatar: teammate.avatar,
        game: teammate.game,
        hourlyRate: teammate.hourlyRate,
        lastSeen: teammate.lastSeen
      }))
    });

  } catch (error) {
    console.error('Admin dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
