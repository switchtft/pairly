import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.authSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw error;
  }
}

export async function cleanupOrphanedSessions() {
  try {
    // Find sessions where the user no longer exists
    const orphanedSessions = await prisma.authSession.findMany({
      where: {
        user: null
      }
    });

    if (orphanedSessions.length > 0) {
      const result = await prisma.authSession.deleteMany({
        where: {
          user: null
        }
      });

      console.log(`Cleaned up ${result.count} orphaned sessions`);
      return result.count;
    }

    return 0;
  } catch (error) {
    console.error('Error cleaning up orphaned sessions:', error);
    throw error;
  }
}

export async function updateUserOnlineStatus() {
  try {
    // Set users as offline if they haven't been seen in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await prisma.user.updateMany({
      where: {
        lastSeen: {
          lt: thirtyMinutesAgo
        },
        isOnline: true
      },
      data: {
        isOnline: false
      }
    });

    console.log(`Updated ${result.count} users to offline status`);
    return result.count;
  } catch (error) {
    console.error('Error updating user online status:', error);
    throw error;
  }
}

export async function performMaintenance() {
  try {
    console.log('Starting database maintenance...');
    
    const expiredCount = await cleanupExpiredSessions();
    const orphanedCount = await cleanupOrphanedSessions();
    const offlineCount = await updateUserOnlineStatus();
    
    console.log(`Maintenance completed: ${expiredCount} expired sessions, ${orphanedCount} orphaned sessions, ${offlineCount} users set offline`);
    
    return {
      expiredSessions: expiredCount,
      orphanedSessions: orphanedCount,
      usersSetOffline: offlineCount
    };
  } catch (error) {
    console.error('Maintenance failed:', error);
    throw error;
  }
} 