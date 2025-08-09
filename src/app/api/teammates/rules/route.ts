import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get teammate rules
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
        userType: true
      }
    });

    if (!user?.isPro || user.userType !== 'teammate') {
      return NextResponse.json({ error: 'Not authorized as teammate' }, { status: 403 });
    }

    // Return static teammate rules
    const rules = [
      {
        id: 1,
        title: "Professional Conduct",
        description: "Always maintain professional behavior during sessions. Be respectful, punctual, and communicative with customers.",
        category: "conduct"
      },
      {
        id: 2,
        title: "Session Quality",
        description: "Provide high-quality gameplay assistance. Focus on helping customers improve their skills and achieve their goals.",
        category: "quality"
      },
      {
        id: 3,
        title: "Communication",
        description: "Maintain clear communication throughout sessions. Use voice chat when possible and respond promptly to messages.",
        category: "communication"
      },
      {
        id: 4,
        title: "Punctuality",
        description: "Be on time for all scheduled sessions. If you need to cancel or reschedule, provide at least 2 hours notice.",
        category: "scheduling"
      },
      {
        id: 5,
        title: "Game Knowledge",
        description: "Stay updated on game meta, strategies, and current patches. Provide accurate and helpful advice to customers.",
        category: "expertise"
      },
      {
        id: 6,
        title: "Privacy & Security",
        description: "Never share customer information or session details with others. Respect customer privacy at all times.",
        category: "privacy"
      },
      {
        id: 7,
        title: "Payment & Payouts",
        description: "Complete sessions properly to ensure timely payment processing. Request payouts through the official system only.",
        category: "financial"
      },
      {
        id: 8,
        title: "Online Status",
        description: "Keep your online status accurate. Go offline when you're not available to accept new orders.",
        category: "availability"
      },
      {
        id: 9,
        title: "Customer Relations",
        description: "Build positive relationships with customers. Handle disputes professionally and escalate issues when necessary.",
        category: "relationships"
      },
      {
        id: 10,
        title: "Platform Policies",
        description: "Follow all platform terms of service and community guidelines. Violations may result in account suspension.",
        category: "compliance"
      }
    ];

    return NextResponse.json({
      rules,
      lastUpdated: new Date().toISOString(),
      version: "1.0"
    });

  } catch (error) {
    console.error('Teammate rules GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
