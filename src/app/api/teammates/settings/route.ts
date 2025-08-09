import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate settings
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

    // Verify user is a teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        isPro: true, 
        userType: true,
        isOnline: true,
        autoAccept: true,
        notificationPreferences: true,
        availability: true,
        hourlyRate: true,
        game: true,
        rank: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    return NextResponse.json({
      settings: {
        isOnline: user.isOnline,
        autoAccept: user.autoAccept || false,
        notificationPreferences: user.notificationPreferences || {},
        availability: user.availability || {},
        hourlyRate: user.hourlyRate,
        game: user.game,
        rank: user.rank
      }
    });

  } catch (error) {
    console.error('Teammate settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update teammate settings
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

    // Verify user is a teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        isPro: true, 
        userType: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    const body = await request.json();
    const {
      isOnline,
      autoAccept,
      notificationPreferences,
      availability,
      hourlyRate
    } = body;

    // Update teammate settings
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(isOnline !== undefined && { isOnline }),
        ...(autoAccept !== undefined && { autoAccept }),
        ...(notificationPreferences !== undefined && { notificationPreferences }),
        ...(availability !== undefined && { availability }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(isOnline !== undefined && { lastSeen: new Date() }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        isOnline: true,
        autoAccept: true,
        notificationPreferences: true,
        availability: true,
        hourlyRate: true,
        lastSeen: true
      }
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedUser
    });

  } catch (error) {
    console.error('Teammate settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Toggle online status
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify user is a teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        isPro: true, 
        userType: true,
        isOnline: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'toggle-online') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Toggle online status
    const newOnlineStatus = !user.isOnline;
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        isOnline: newOnlineStatus,
        lastSeen: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        isOnline: true,
        lastSeen: true
      }
    });

    return NextResponse.json({
      message: `Now ${newOnlineStatus ? 'online' : 'offline'}`,
      isOnline: newOnlineStatus,
      lastSeen: updatedUser.lastSeen
    });

  } catch (error) {
    console.error('Teammate online status toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
