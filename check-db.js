const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        game: true,
        rank: true,
        role: true,
        isPro: true,
        verified: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ${user.game} ${user.rank} ${user.role} ${user.isPro ? '⭐ PRO' : ''}`);
    });
    
    // Check sessions
    const sessions = await prisma.session.findMany();
    console.log(`\n📅 Found ${sessions.length} sessions`);
    
    // Check tournaments
    const tournaments = await prisma.tournament.findMany();
    console.log(`🏆 Found ${tournaments.length} tournaments`);
    
    // Check queue entries
    const queueEntries = await prisma.queueEntry.findMany();
    console.log(`⏳ Found ${queueEntries.length} queue entries`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
