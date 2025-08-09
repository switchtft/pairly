const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupExpiredSessions() {
  try {
    const result = await prisma.authSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`✅ Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('❌ Error cleaning up expired sessions:', error);
    throw error;
  }
}

async function updateUserOnlineStatus() {
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

    console.log(`✅ Updated ${result.count} users to offline status`);
    return result.count;
  } catch (error) {
    console.error('❌ Error updating user online status:', error);
    throw error;
  }
}

async function performMaintenance() {
  try {
    console.log('🔄 Starting database maintenance...');
    
    const expiredCount = await cleanupExpiredSessions();
    const offlineCount = await updateUserOnlineStatus();
    
    console.log(`✅ Maintenance completed: ${expiredCount} expired sessions, ${offlineCount} users set offline`);
    
    return {
      expiredSessions: expiredCount,
      usersSetOffline: offlineCount
    };
  } catch (error) {
    console.error('❌ Maintenance failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run maintenance if this script is executed directly
if (require.main === module) {
  performMaintenance()
    .then(() => {
      console.log('🎉 Maintenance script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Maintenance script failed:', error);
      process.exit(1);
    });
}

module.exports = { performMaintenance }; 