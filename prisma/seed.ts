import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create administrator user
  const adminUser = {
    email: 'admin@pairly.com',
    password: hashedPassword,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
    verified: true,
    isPro: false,
  };

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {},
    create: adminUser,
  });

  // Create some pro players
  const proPlayers = [
    {
      email: 'capychill@example.com',
      password: hashedPassword,
      username: 'CapyChill',
      rank: 'Diamond 3',
      game: 'valorant',
      role: 'teammate',
      isPro: true,
      verified: true,
    },
    {
      email: 'capyzen@example.com',
      password: hashedPassword,
      username: 'CapyZen',
      rank: 'Immortal 1',
      game: 'valorant',
      role: 'teammate',
      isPro: true,
      verified: true,
    },
    {
      email: 'capynap@example.com',
      password: hashedPassword,
      username: 'CapyNap',
      rank: 'Ascendant 2',
      game: 'valorant',
      role: 'teammate',
      isPro: true,
      verified: true,
    },
    {
      email: 'capyleaf@example.com',
      password: hashedPassword,
      username: 'CapyLeaf',
      rank: 'Master',
      game: 'league',
      role: 'teammate',
      isPro: true,
      verified: true,
    },
    {
      email: 'capyking@example.com',
      password: hashedPassword,
      username: 'CapyKing',
      rank: 'Radiant',
      game: 'valorant',
      role: 'teammate',
      isPro: true,
      verified: true,
    },
  ];

  for (const player of proPlayers) {
    await prisma.user.upsert({
      where: { email: player.email },
      update: {},
      create: player,
    });
  }

  // Create some regular customers
  const customers = [
    {
      email: 'customer1@example.com',
      password: hashedPassword,
      username: 'Customer1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      verified: true,
      isPro: false,
    },
    {
      email: 'customer2@example.com',
      password: hashedPassword,
      username: 'Customer2',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'customer',
      verified: false,
      isPro: false,
    },
  ];

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    });
  }

  // Create some sample sessions for testing
  const sessions = [
    {
      game: 'valorant',
      mode: 'Competitive',
      status: 'active',
      startTime: new Date(),
      price: 25.0,
      duration: 60,
      clientId: 7, // Customer1
      proTeammateId: 2, // CapyZen
    },
    {
      game: 'league',
      mode: 'Ranked',
      status: 'completed',
      startTime: new Date(Date.now() - 86400000), // 1 day ago
      endTime: new Date(Date.now() - 82800000), // 1 day ago + 1 hour
      price: 30.0,
      duration: 60,
      clientId: 8, // Customer2
      proTeammateId: 5, // CapyKing
    },
    {
      game: 'valorant',
      mode: 'Unrated',
      status: 'pending',
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      price: 20.0,
      duration: 45,
      clientId: 7, // Customer1
    },
  ];

  for (const session of sessions) {
    await prisma.session.upsert({
      where: { 
        id: sessions.indexOf(session) + 1 
      },
      update: {},
      create: session,
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