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
        { difficulty: 'asc' },
        { points: 'desc' }
      ]
    });

    // Map quests with user progress
    const questsWithProgress = allQuests.map(quest => {
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      const isCompleted = userQuest?.isCompleted || false;
      const progress = userQuest?.progress || 0;
      const completedAt = userQuest?.completedAt;

      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        points: quest.points,
        requirements: quest.requirements,
        isActive: quest.isActive,
        expiresAt: quest.expiresAt,
        userProgress: {
          isCompleted,
          progress,
          completedAt,
          startedAt: userQuest?.startedAt
        }
      };
    });

    // Get user's quest statistics
    const questStats = await prisma.$transaction([
      prisma.userQuest.count({
        where: { 
          userId: parseInt(userId),
          isCompleted: true
        }
      }),
      prisma.userQuest.aggregate({
        where: { 
          userId: parseInt(userId),
          isCompleted: true
        },
        _sum: { pointsEarned: true }
      }),
      prisma.userQuest.count({
        where: { 
          userId: parseInt(userId),
          isCompleted: false
        }
      })
    ]);

    const [completedQuests, totalPointsEarned, activeQuests] = questStats;

    return NextResponse.json({
      quests: questsWithProgress,
      stats: {
        totalQuests: allQuests.length,
        completedQuests,
        activeQuests,
        totalPointsEarned: totalPointsEarned._sum.pointsEarned || 0
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

    // Start the quest
    const userQuest = await prisma.userQuest.create({
      data: {
        userId: decoded.userId,
        questId: parseInt(questId),
        startedAt: new Date(),
        progress: 0,
        isCompleted: false
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
          type: userQuest.quest.type,
          difficulty: userQuest.quest.difficulty,
          points: userQuest.quest.points,
          requirements: userQuest.quest.requirements
        },
        startedAt: userQuest.startedAt,
        progress: userQuest.progress,
        isCompleted: userQuest.isCompleted
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

    if (userQuest.isCompleted) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 409 });
    }

    let newProgress = userQuest.progress;
    let isCompleted = false;
    let pointsEarned = 0;

    switch (action) {
      case 'increment':
        newProgress = Math.min(userQuest.progress + 1, userQuest.quest.requirements);
        break;
      case 'set':
        if (progress !== undefined) {
          newProgress = Math.min(parseInt(progress), userQuest.quest.requirements);
        }
        break;
      case 'complete':
        newProgress = userQuest.quest.requirements;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if quest is completed
    if (newProgress >= userQuest.quest.requirements) {
      isCompleted = true;
      pointsEarned = userQuest.quest.points;
    }

    // Update quest progress
    const updatedUserQuest = await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        pointsEarned: isCompleted ? pointsEarned : 0
      }
    });

    // If quest completed, add points to user's leaderboard
    if (isCompleted) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          leaderboardPoints: {
            increment: pointsEarned
          }
        }
      });
    }

    return NextResponse.json({
      message: isCompleted ? 'Quest completed!' : 'Quest progress updated',
      userQuest: {
        id: updatedUserQuest.id,
        progress: updatedUserQuest.progress,
        isCompleted: updatedUserQuest.isCompleted,
        completedAt: updatedUserQuest.completedAt,
        pointsEarned: updatedUserQuest.pointsEarned
      },
      questCompleted: isCompleted,
      pointsEarned
    });

  } catch (error) {
    console.error('Quest progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
