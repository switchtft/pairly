import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { notifyMatchFound } from '@/lib/socket';

// Initialize Stripe only if secret key is available
let stripe: any = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

// GET - Get current queue status and available teammates
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

    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'valorant';

    // Get available teammates (pro users who are online and not in a session)
    const availableTeammates = await prisma.user.findMany({
      where: {
        isPro: true,
        isOnline: true,
        game: game,
        // Not currently in an active session
        proSessions: {
          none: {
            status: {
              in: ['Pending', 'Active']
            }
          }
        }
      },
      select: {
        id: true,
        username: true,
        rank: true,
        role: true,
        game: true,
        verified: true,
        lastSeen: true,
        reviewsReceived: {
          select: {
            rating: true
          }
        }
      }
    });

    // Get current queue for this game
    const queueEntries = await prisma.queueEntry.findMany({
      where: {
        game: game,
        status: 'waiting',
        paymentStatus: 'paid'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            rank: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      availableTeammates: availableTeammates.map(teammate => ({
        ...teammate,
        averageRating: teammate.reviewsReceived.length > 0 
          ? teammate.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / teammate.reviewsReceived.length
          : 0
      })),
      queueLength: queueEntries.length,
      estimatedWaitTime: queueEntries.length * 2 // Rough estimate: 2 minutes per person in queue
    });

  } catch (error) {
    console.error('Queue GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create booking and join queue
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
    const { 
      game, 
      gameMode, 
      numberOfMatches, 
      teammatesNeeded, 
      pricePerMatch, 
      totalPrice, 
      specialRequests, 
      discountCode 
    } = body;

    if (!game || !gameMode || !numberOfMatches || !teammatesNeeded || !pricePerMatch || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is already in queue
    const existingEntry = await prisma.queueEntry.findFirst({
      where: {
        userId: decoded.userId,
        status: 'waiting'
      }
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'Already in queue' }, { status: 400 });
    }

    // Validate discount code if provided
    let discountAmount = 0;
    let discountCodeRecord = null;
    
    if (discountCode) {
      const discountCodeData = await prisma.discountCode.findUnique({
        where: { code: discountCode.toUpperCase() },
      });

      if (discountCodeData && discountCodeData.isActive) {
        if (discountCodeData.validUntil && new Date() > discountCodeData.validUntil) {
          return NextResponse.json({ error: 'Discount code has expired' }, { status: 400 });
        }

        if (discountCodeData.maxUses && discountCodeData.currentUses >= discountCodeData.maxUses) {
          return NextResponse.json({ error: 'Discount code usage limit reached' }, { status: 400 });
        }

        if (totalPrice < discountCodeData.minAmount) {
          return NextResponse.json({ 
            error: `Minimum order amount of $${discountCodeData.minAmount} required` 
          }, { status: 400 });
        }

        if (discountCodeData.applicableGames.length > 0 && 
            !discountCodeData.applicableGames.includes(game)) {
          return NextResponse.json({ 
            error: 'Discount code does not apply to this game' 
          }, { status: 400 });
        }

        // Calculate discount amount
        if (discountCodeData.discountType === 'percentage') {
          discountAmount = (totalPrice * discountCodeData.discountValue) / 100;
        } else if (discountCodeData.discountType === 'fixed') {
          discountAmount = discountCodeData.discountValue;
        } else if (discountCodeData.discountType === 'free') {
          discountAmount = totalPrice; // 100% off
        }

        discountAmount = Math.min(discountAmount, totalPrice);
        discountCodeRecord = discountCodeData;
      }
    }

    const finalPrice = Math.max(0, totalPrice - discountAmount);

    // Create Stripe payment intent if Stripe is configured
    let paymentIntent = null;
    if (stripe) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(finalPrice * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            userId: decoded.userId.toString(),
            game,
            gameMode,
            numberOfMatches: numberOfMatches.toString(),
            teammatesNeeded: teammatesNeeded.toString(),
            discountCode: discountCode || '',
          },
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 });
      }
    }

    // Create queue entry
    const queueEntry = await prisma.queueEntry.create({
      data: {
        userId: decoded.userId,
        game,
        gameMode,
        numberOfMatches,
        teammatesNeeded,
        duration: 30, // Default 30 minutes per match
        pricePerMatch,
        totalPrice: finalPrice,
        status: 'waiting',
        paymentStatus: stripe ? 'pending' : 'paid', // If no Stripe, mark as paid
        specialRequests,
      },
      include: {
        user: {
          select: {
            username: true,
            rank: true
          }
        }
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: decoded.userId,
        queueEntryId: queueEntry.id,
        amount: finalPrice,
        originalAmount: totalPrice,
        discountAmount,
        method: stripe ? 'stripe' : 'manual',
        status: stripe ? 'pending' : 'completed',
        stripePaymentIntentId: paymentIntent?.id,
        discountCodeId: discountCodeRecord?.id,
      }
    });

    // Update discount code usage if applicable
    if (discountCodeRecord) {
      await prisma.discountCode.update({
        where: { id: discountCodeRecord.id },
        data: { currentUses: { increment: 1 } }
      });

      await prisma.discountCodeUsage.create({
        data: {
          discountCodeId: discountCodeRecord.id,
          userId: decoded.userId,
          orderAmount: totalPrice,
          discountAmount,
        }
      });
    }

    // Try to find a match immediately if payment is not required
    if (!stripe) {
      const match = await findMatch(queueEntry);
      if (match) {
        // Notify both users via WebSocket
        await notifyMatchFound(match.id, decoded.userId, match.proTeammateId!);
        
        return NextResponse.json({ 
          success: true, 
          matchFound: true,
          sessionId: match.id,
          teammate: match.proTeammate,
          queueEntryId: queueEntry.id,
          paymentRequired: false
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      queueEntryId: queueEntry.id,
      paymentIntentId: paymentIntent?.id,
      clientSecret: paymentIntent?.client_secret,
      estimatedWaitTime: 5, // 5 minutes estimate
      paymentRequired: !!stripe // Indicate if payment is required
    });

  } catch (error) {
    console.error('Queue POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Leave the queue
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

    // Remove user from queue
    await prisma.queueEntry.deleteMany({
      where: {
        userId: decoded.userId,
        status: 'waiting'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Queue DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to find a match
async function findMatch(queueEntry: { id: number; userId: number; game: string; mode: string; price: number; duration: number }) {
  // Find available teammates
  const availableTeammates = await prisma.user.findMany({
    where: {
      isPro: true,
      isOnline: true,
      game: queueEntry.game,
      proSessions: {
        none: {
          status: {
            in: ['Pending', 'Active']
          }
        }
      }
    },
    take: 1
  });

  if (availableTeammates.length === 0) {
    return null;
  }

  const teammate = availableTeammates[0];

  // Create a session
  const session = await prisma.session.create({
    data: {
      clientId: queueEntry.userId,
      proTeammateId: teammate.id,
      game: queueEntry.game,
      mode: queueEntry.mode,
      status: 'Pending',
      startTime: new Date(),
      price: queueEntry.price,
      duration: queueEntry.duration
    },
    include: {
      client: {
        select: {
          username: true,
          rank: true
        }
      },
      proTeammate: {
        select: {
          username: true,
          rank: true
        }
      }
    }
  });

  // Remove from queue
  await prisma.queueEntry.delete({
    where: { id: queueEntry.id }
  });

  return session;
} 