import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Apply to become a teammate
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
    const { game, rank, role, experience, availability, whyJoin } = body;

    // Validate required fields
    if (!game || !rank || !role || !experience || !availability || !whyJoin) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user is already a teammate
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isPro: true }
    });

    if (existingUser?.isPro) {
      return NextResponse.json({ error: 'You are already a teammate' }, { status: 400 });
    }

    // Update user profile with teammate application data
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        game,
        rank,
        role,
        // Store application data in bio field for now
        bio: `Teammate Application:
Experience: ${experience}
Availability: ${availability}
Why Join: ${whyJoin}
Status: Pending Review`
      }
    });

    // In a real application, you might want to:
    // 1. Create a separate TeammateApplication model
    // 2. Send email notifications to admins
    // 3. Store application status and review process

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully. We will review and get back to you within 24-48 hours.'
    });

  } catch (error) {
    console.error('Become teammate POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 