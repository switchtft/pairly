import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create some pro players
  const proPlayers = [
    {
      email: 'capychill@example.com',
      password: hashedPassword,
      username: 'CapyChill',
      rank: 'Diamond 3',
      game: 'valorant',
      role: 'Duelist',
      isPro: true,
      isOnline: true,
      verified: true,
      bio: 'Professional Valorant player specializing in aggressive plays and entry fragging.',
      discord: 'capychill#1234',
      steam: 'steamcommunity.com/id/capychill',
      timezone: 'UTC-5',
      languages: 'English,Portuguese',
    },
    {
      email: 'capyzen@example.com',
      password: hashedPassword,
      username: 'CapyZen',
      rank: 'Immortal 1',
      game: 'valorant',
      role: 'Controller',
      isPro: true,
      isOnline: true,
      verified: true,
      bio: 'Strategic controller main with excellent game sense and utility usage.',
      discord: 'capyzen#5678',
      steam: 'steamcommunity.com/id/capyzen',
      timezone: 'UTC-3',
      languages: 'English,Spanish',
    },
    {
      email: 'capynap@example.com',
      password: hashedPassword,
      username: 'CapyNap',
      rank: 'Ascendant 2',
      game: 'valorant',
      role: 'Initiator',
      isPro: true,
      isOnline: true,
      verified: true,
      bio: 'Initiator specialist with great communication and team coordination skills.',
      discord: 'capynap#9012',
      steam: 'steamcommunity.com/id/capynap',
      timezone: 'UTC+1',
      languages: 'English,French',
    },
    {
      email: 'capyleaf@example.com',
      password: hashedPassword,
      username: 'CapyLeaf',
      rank: 'Master',
      game: 'league',
      role: 'Jungle',
      isPro: true,
      isOnline: true,
      verified: true,
      bio: 'League of Legends jungle main with excellent map awareness and objective control.',
      discord: 'capyleaf#3456',
      steam: 'steamcommunity.com/id/capyleaf',
      timezone: 'UTC+0',
      languages: 'English,German',
    },
    {
      email: 'capyking@example.com',
      password: hashedPassword,
      username: 'CapyKing',
      rank: 'Radiant',
      game: 'valorant',
      role: 'Sentinel',
      isPro: true,
      isOnline: true,
      verified: true,
      bio: 'Radiant-ranked sentinel main with exceptional aim and game knowledge.',
      discord: 'capyking#7890',
      steam: 'steamcommunity.com/id/capyking',
      timezone: 'UTC-8',
      languages: 'English,Korean',
    },
  ];

  for (const player of proPlayers) {
    await prisma.user.upsert({
      where: { email: player.email },
      update: {
        isOnline: true,
        lastSeen: new Date(),
      },
      create: player,
    });
  }

  // Create an admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pairly.com' },
    update: {},
    create: {
      email: 'admin@pairly.com',
      password: hashedPassword,
      username: 'Admin',
      isAdmin: true,
      isOnline: true,
      verified: true,
      bio: 'System administrator',
      game: 'valorant',
      role: 'Admin',
      rank: 'Admin',
      timezone: 'UTC+0',
      languages: 'English',
    },
  });

  // Create demo user with password 'password'
  const demoPassword = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'demo@pairly.com' },
    update: {},
    create: {
      email: 'demo@pairly.com',
      password: demoPassword,
      username: 'DemoUser',
      isOnline: true,
      verified: true,
      bio: 'Demo account for testing',
      game: 'valorant',
      role: 'Duelist',
      rank: 'Gold',
      timezone: 'UTC+0',
      languages: 'English',
    },
  });

  // Create sample discount codes
  const discountCodes = [
    {
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      maxUses: 100,
      validUntil: new Date('2025-12-31'),
      minAmount: 10,
      applicableGames: '',
      createdBy: adminUser.id,
    },
    {
      code: 'VALORANT10',
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 50,
      validUntil: new Date('2025-12-31'),
      minAmount: 15,
      applicableGames: 'valorant',
      createdBy: adminUser.id,
    },
    {
      code: 'LEAGUE15',
      discountType: 'percentage',
      discountValue: 15,
      maxUses: 30,
      validUntil: new Date('2025-12-31'),
      minAmount: 20,
      applicableGames: 'league',
      createdBy: adminUser.id,
    },
    {
      code: 'FREESESSION',
      discountType: 'free',
      discountValue: 100,
      maxUses: 5,
      validUntil: new Date('2025-12-31'),
      minAmount: 0,
      applicableGames: '',
      createdBy: adminUser.id,
    },
    {
      code: 'SAVE5',
      discountType: 'fixed',
      discountValue: 5,
      maxUses: 200,
      validUntil: new Date('2025-12-31'),
      minAmount: 25,
      applicableGames: '',
      createdBy: adminUser.id,
    },
  ];

  for (const discountCode of discountCodes) {
    await prisma.discountCode.upsert({
      where: { code: discountCode.code },
      update: {},
      create: discountCode,
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });