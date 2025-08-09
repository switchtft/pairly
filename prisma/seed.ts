import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = [
    {
      email: 'capychill@example.com',
      username: 'CapyChill',
      password: hashedPassword,
      userType: 'teammate', // Changed from default 'customer'
      game: 'valorant',
      role: 'Duelist',
      rank: 'Diamond 3',
      isPro: true,
      verified: true,
      bio: 'Professional Valorant player specializing in aggressive plays and entry fragging.',
      discord: 'capychill#1234',
      steam: 'steamcommunity.com/id/capychill',
      timezone: 'UTC-5',
      languages: 'English,Portuguese',
      hourlyRate: 25.00,
      availability: 'Weekdays 6-10 PM, Weekends 2-8 PM',
    },
    {
      email: 'capyzen@example.com',
      username: 'CapyZen',
      password: hashedPassword,
      userType: 'teammate', // Changed from default 'customer'
      game: 'valorant',
      role: 'Controller',
      rank: 'Immortal 1',
      isPro: true,
      verified: true,
      bio: 'Strategic controller main with excellent game sense and utility usage.',
      discord: 'capyzen#5678',
      steam: 'steamcommunity.com/id/capyzen',
      timezone: 'UTC-3',
      languages: 'English,Spanish',
      hourlyRate: 30.00,
      availability: 'Weekdays 7-11 PM, Weekends 3-9 PM',
    },
    {
      email: 'capynap@example.com',
      username: 'CapyNap',
      password: hashedPassword,
      userType: 'teammate', // Changed from default 'customer'
      game: 'valorant',
      role: 'Initiator',
      rank: 'Ascendant 2',
      isPro: true,
      verified: true,
      bio: 'Initiator specialist with great communication and team coordination skills.',
      discord: 'capynap#9012',
      steam: 'steamcommunity.com/id/capynap',
      timezone: 'UTC+1',
      languages: 'English,French',
      hourlyRate: 22.50,
      availability: 'Weekdays 5-9 PM, Weekends 1-7 PM',
    },
    {
      email: 'capyleaf@example.com',
      username: 'CapyLeaf',
      password: hashedPassword,
      userType: 'teammate', // Changed from default 'customer'
      game: 'league',
      role: 'Jungle',
      rank: 'Master',
      isPro: true,
      verified: true,
      bio: 'League of Legends jungle main with excellent map awareness and objective control.',
      discord: 'capyleaf#3456',
      steam: 'steamcommunity.com/id/capyleaf',
      timezone: 'UTC+0',
      languages: 'English,German',
      hourlyRate: 35.00,
      availability: 'Weekdays 6-10 PM, Weekends 2-8 PM',
    },
    {
      email: 'capyking@example.com',
      username: 'CapyKing',
      password: hashedPassword,
      userType: 'teammate', // Changed from default 'customer'
      game: 'valorant',
      role: 'Sentinel',
      rank: 'Radiant',
      isPro: true,
      verified: true,
      bio: 'Radiant-ranked sentinel main with exceptional aim and game knowledge.',
      discord: 'capyking#7890',
      steam: 'steamcommunity.com/id/capyking',
      timezone: 'UTC-8',
      languages: 'English,Korean',
      hourlyRate: 50.00,
      availability: 'Weekdays 7-11 PM, Weekends 3-9 PM',
    },
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: userData
      })
      console.log(`Created user: ${userData.username} (${userData.userType})`)
    } else {
      // Update existing user to have correct userType
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          userType: userData.userType,
          hourlyRate: userData.hourlyRate,
          availability: userData.availability,
        }
      })
      console.log(`Updated user: ${userData.username} (${userData.userType})`)
    }
  }

  // Create an admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pairly.com' },
    update: {
      userType: 'admin', // Added missing userType
    },
    create: {
      email: 'admin@pairly.com',
      password: hashedPassword,
      username: 'Admin',
      userType: 'admin', // Added missing userType
      isAdmin: true,
      verified: true,
      bio: 'System administrator',
      game: 'valorant',
      role: 'Admin',
      rank: 'Admin',
      timezone: 'UTC+0',
      languages: 'English',
    },
  });
  console.log(`Admin user: ${adminUser.username} (${adminUser.userType})`);

  // Create demo customer user
  const demoPassword = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'demo@pairly.com' },
    update: {
      userType: 'customer', // Explicitly set customer type
    },
    create: {
      email: 'demo@pairly.com',
      password: demoPassword,
      username: 'DemoCustomer',
      userType: 'customer', // Explicitly set customer type
      verified: true,
      bio: 'Demo customer account for testing',
      game: 'valorant',
      role: 'Duelist',
      rank: 'Gold',
      timezone: 'UTC+0',
      languages: 'English',
    },
  });
  console.log('Demo customer user: DemoCustomer (customer)');

  // Create demo teammate user
  await prisma.user.upsert({
    where: { email: 'teammate@pairly.com' },
    update: {
      userType: 'teammate',
    },
    create: {
      email: 'teammate@pairly.com',
      password: demoPassword,
      username: 'DemoTeammate',
      userType: 'teammate',
      isPro: true,
      verified: true,
      bio: 'Demo teammate account for testing',
      game: 'valorant',
      role: 'Controller',
      rank: 'Platinum',
      timezone: 'UTC+0',
      languages: 'English',
      hourlyRate: 20.00,
      availability: 'Weekdays 6-10 PM, Weekends 2-8 PM',
    },
  });
  console.log('Demo teammate user: DemoTeammate (teammate)');

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })