import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create some pro players
  const proPlayers = [
    {
      email: 'capychill@example.com',
      password: 'hashedpassword123', // In real app, hash this
      username: 'CapyChill',
      rank: 'Diamond 3',
      game: 'valorant',
      role: 'Duelist',
      isPro: true,
    },
    {
      email: 'capyzen@example.com',
      password: 'hashedpassword123',
      username: 'CapyZen',
      rank: 'Immortal 1',
      game: 'valorant',
      role: 'Controller',
      isPro: true,
    },
    {
      email: 'capynap@example.com',
      password: 'hashedpassword123',
      username: 'CapyNap',
      rank: 'Ascendant 2',
      game: 'valorant',
      role: 'Initiator',
      isPro: true,
    },
    {
      email: 'capyleaf@example.com',
      password: 'hashedpassword123',
      username: 'CapyLeaf',
      rank: 'Master',
      game: 'league',
      role: 'Jungle',
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