import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get available quests
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
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    // Get user's current quest progress
    const userQuests = await prisma.userQuest.findMany({
      where: { userId: parseInt(userId) },
      include: {
        quest: true
      }
    });

    // Get all available quests
    const allQuests = await prisma.quest.findMany({
      where: { isActive: true },
      orderBy: [
        { points: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Map quests with user progress
    const questsWithProgress = allQuests.map(quest => {
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      const isCompleted = !!userQuest;
      const completedAt = userQuest?.completedAt;

      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        points: quest.points,
        requirements: quest.requirements,
        isActive: quest.isActive,
        createdAt: quest.createdAt,
        userProgress: {
          isCompleted,
          completedAt
        }
      };
    });

    // Get user's quest statistics
    const completedQuests = await prisma.userQuest.count({
      where: { 
        userId: parseInt(userId)
      }
    });

    // Calculate total points earned from completed quests
    const completedUserQuests = await prisma.userQuest.findMany({
      where: { 
        userId: parseInt(userId)
      },
      include: {
        quest: {
          select: {
            points: true
          }
        }
      }
    });

    const totalPointsEarned = completedUserQuests.reduce((sum, userQuest) => {
      return sum + (userQuest.quest?.points || 0);
    }, 0);

    const activeQuests = 0; // UserQuest model doesn't track active/in-progress quests

    return NextResponse.json({
      quests: questsWithProgress,
      stats: {
        totalQuests: allQuests.length,
        completedQuests,
        activeQuests,
        totalPointsEarned: totalPointsEarned
      }
    });

  } catch (error) {
    console.error('Quests GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Start a quest
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
    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 });
    }

    // Check if quest exists and is active
    const quest = await prisma.quest.findUnique({
      where: { id: parseInt(questId) }
    });

    if (!quest || !quest.isActive) {
      return NextResponse.json({ error: 'Quest not found or inactive' }, { status: 404 });
    }

    // Check if user already has this quest
    const existingUserQuest = await prisma.userQuest.findFirst({
      where: {
        userId: decoded.userId,
        questId: parseInt(questId)
      }
    });

    if (existingUserQuest) {
      return NextResponse.json({ error: 'Quest already started' }, { status: 409 });
    }

    // Start the quest by creating a UserQuest entry
    const userQuest = await prisma.userQuest.create({
      data: {
        userId: decoded.userId,
        questId: parseInt(questId)
      },
      include: {
        quest: true
      }
    });

    return NextResponse.json({
      message: 'Quest started successfully',
      userQuest: {
        id: userQuest.id,
        quest: {
          id: userQuest.quest.id,
          title: userQuest.quest.title,
          description: userQuest.quest.description,
          points: userQuest.quest.points,
          requirements: userQuest.quest.requirements
        },
        completedAt: userQuest.completedAt
      }
    });

  } catch (error) {
    console.error('Quest start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update quest progress
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

    const body = await request.json();
    const { questId, progress, action } = body;

    if (!questId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's quest progress
    const userQuest = await prisma.userQuest.findFirst({
      where: {
        userId: decoded.userId,
        questId: parseInt(questId)
      },
      include: {
        quest: true
      }
    });

    if (!userQuest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // For now, we'll just mark the quest as completed
    // since UserQuest model doesn't support progress tracking
    if (action === 'complete') {
      // Update quest to mark as completed
      const updatedUserQuest = await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: {
          completedAt: new Date()
        }
      });

      // Add points to user's leaderboard
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          leaderboardPoints: {
            increment: userQuest.quest.points
          }
        }
      });

      return NextResponse.json({
        message: 'Quest completed!',
        userQuest: {
          id: updatedUserQuest.id,
          completedAt: updatedUserQuest.completedAt
        },
        questCompleted: true,
        pointsEarned: userQuest.quest.points
      });
    } else {
      return NextResponse.json({ error: 'Only complete action is supported' }, { status: 400 });
    }

  } catch (error) {
    console.error('Quest progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
