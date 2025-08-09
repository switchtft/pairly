import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get all orders (with filtering and pagination)
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const game = searchParams.get('game');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (game) {
      whereClause.game = game;
    }
    
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }
    
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    // Get orders with pagination
    const orders = await prisma.queueEntry.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            userType: true
          }
        },
        assignedTeammate: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            game: true,
            rank: true,
            hourlyRate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalOrders = await prisma.queueEntry.count({
      where: whereClause
    });

    // Get order statistics
    const stats = await prisma.$transaction([
      prisma.queueEntry.count({ where: { status: 'waiting' } }),
      prisma.queueEntry.count({ where: { status: 'in_progress' } }),
      prisma.queueEntry.count({ where: { status: 'completed' } }),
      prisma.queueEntry.count({ where: { status: 'cancelled' } }),
      prisma.queueEntry.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalPrice: true }
      }),
      prisma.queueEntry.aggregate({
        where: { 
          paymentStatus: 'paid',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        },
        _sum: { totalPrice: true }
      })
    ]);

    const [waitingOrders, inProgressOrders, completedOrders, cancelledOrders, totalRevenue, todayRevenue] = stats;

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customer: {
        id: order.user.id,
        username: order.user.username,
        name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.username,
        avatar: order.user.avatar,
        email: order.user.email,
        userType: order.user.userType
      },
      teammate: order.assignedTeammate ? {
        id: order.assignedTeammate.id,
        username: order.assignedTeammate.username,
        name: `${order.assignedTeammate.firstName || ''} ${order.assignedTeammate.lastName || ''}`.trim() || order.assignedTeammate.username,
        avatar: order.assignedTeammate.avatar,
        game: order.assignedTeammate.game,
        rank: order.assignedTeammate.rank,
        hourlyRate: order.assignedTeammate.hourlyRate
      } : null,
      game: order.game,
      gameMode: order.gameMode,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalPrice: order.totalPrice,
      duration: order.duration,
      specialRequests: order.specialRequests,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      },
      stats: {
        totalOrders,
        waitingOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        todayRevenue: todayRevenue._sum.totalPrice || 0
      }
    });

  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      orderId,
      status,
      assignedTeammateId,
      notes
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await prisma.queueEntry.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.queueEntry.update({
      where: { id: parseInt(orderId) },
      data: {
        ...(status !== undefined && { status }),
        ...(assignedTeammateId !== undefined && { assignedTeammateId: assignedTeammateId ? parseInt(assignedTeammateId) : null }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        assignedTeammate: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        assignedTeammateId: updatedOrder.assignedTeammateId,
        notes: updatedOrder.notes,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel order
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

    // Verify user is an admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await prisma.queueEntry.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cancel order
    const cancelledOrder = await prisma.queueEntry.update({
      where: { id: parseInt(orderId) },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Order cancelled successfully',
      orderId: cancelledOrder.id
    });

  } catch (error) {
    console.error('Admin order cancellation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
