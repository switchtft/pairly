import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get all users (with filtering and pagination)
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
    const userType = searchParams.get('userType');
    const game = searchParams.get('game');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: {
      userType?: string;
      game?: string;
      isOnline?: boolean;
      OR?: Array<{
        username?: { contains: string; mode: string };
        firstName?: { contains: string; mode: string };
        lastName?: { contains: string; mode: string };
        email?: { contains: string; mode: string };
      }>;
    } = {};
    
    if (userType) {
      whereClause.userType = userType;
    }
    
    if (game) {
      whereClause.game = game;
    }
    
    if (status === 'online') {
      whereClause.isOnline = true;
    } else if (status === 'offline') {
      whereClause.isOnline = false;
    }
    
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isPro: true,
        isOnline: true,
        game: true,
        rank: true,
        hourlyRate: true,
        accountBalance: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        createdAt: true,
        lastSeen: true,
        _count: {
          select: {
            sessions: true,
            reviewsGiven: true,
            reviewsReceived: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause
    });

    // Get user statistics
    const stats = await prisma.$transaction([
      prisma.user.count({ where: { userType: 'customer' } }),
      prisma.user.count({ where: { userType: 'teammate' } }),
      prisma.user.count({ where: { isOnline: true, userType: 'teammate' } }),
      prisma.user.count({ where: { isPro: true, userType: 'teammate' } })
    ]);

    const [totalCustomers, totalTeammates, onlineTeammates, proTeammates] = stats;

    const formattedUsers = users.map(user => ({
      ...user,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      sessionCount: user._count.sessions,
      reviewCount: user._count.reviewsGiven + user._count.reviewsReceived,
      _count: undefined
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      stats: {
        totalUsers,
        totalCustomers,
        totalTeammates,
        onlineTeammates,
        proTeammates
      }
    });

  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user
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
      username,
      email,
      password,
      firstName,
      lastName,
      userType,
      isPro,
      game,
      rank,
      hourlyRate
    } = body;

    // Validate required fields
    if (!username || !email || !password || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists' 
      }, { status: 409 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password, // Note: In production, this should be hashed
        firstName,
        lastName,
        userType,
        isPro: isPro || false,
        game,
        rank,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isOnline: false,
        accountBalance: 0,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isPro: true,
        game: true,
        rank: true,
        hourlyRate: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user
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
      userId,
      username,
      email,
      firstName,
      lastName,
      userType,
      isPro,
      game,
      rank,
      hourlyRate,
      isOnline,
      accountBalance,
      loyaltyPoints,
      loyaltyTier
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
              where: { id: userId },
      data: {
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(userType !== undefined && { userType }),
        ...(isPro !== undefined && { isPro }),
        ...(game !== undefined && { game }),
        ...(rank !== undefined && { rank }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null }),
        ...(isOnline !== undefined && { isOnline }),
        ...(accountBalance !== undefined && { accountBalance: parseFloat(accountBalance) }),
        ...(loyaltyPoints !== undefined && { loyaltyPoints: parseInt(loyaltyPoints) }),
        ...(loyaltyTier !== undefined && { loyaltyTier }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isPro: true,
        game: true,
        rank: true,
        hourlyRate: true,
        isOnline: true,
        accountBalance: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (userId === decoded.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user (this will cascade to related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
