import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Toggle teammate online status
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

    // Verify user is a pro teammate
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true }
    });

    if (!user?.isPro) {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    const body = await request.json();
    const { isOnline } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Invalid online status' }, { status: 400 });
    }

    // Update online status
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        isOnline,
        lastSeen: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ${isOnline ? 'went online' : 'went offline'}`,
      isOnline 
    });

  } catch (error) {
    console.error('Toggle online POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
