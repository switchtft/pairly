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
    },
    {
      email: 'capyzen@example.com',
      password: hashedPassword,
      username: 'CapyZen',
      rank: 'Immortal 1',
      game: 'valorant',
      role: 'Controller',
      isPro: true,
    },
    {
      email: 'capynap@example.com',
      password: hashedPassword,
      username: 'CapyNap',
      rank: 'Ascendant 2',
      game: 'valorant',
      role: 'Initiator',
      isPro: true,
    },
    {
      email: 'capyleaf@example.com',
      password: hashedPassword,
      username: 'CapyLeaf',
      rank: 'Master',
      game: 'league',
      role: 'Jungle',
      isPro: true,
    },
    {
      email: 'capyking@example.com',
      password: hashedPassword,
      username: 'CapyKing',
      rank: 'Radiant',
      game: 'valorant',
      role: 'Sentinel',
      isPro: true,
    },
  ];

  for (const player of proPlayers) {
    await prisma.user.upsert({
      where: { email: player.email },
      update: {},
      create: player,
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