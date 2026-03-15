import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const password = await bcrypt.hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@appreciate.app' },
    update: {},
    create: {
      email: 'demo@appreciate.app',
      name: 'Demo User',
      password,
      provider: 'email',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create streak data
  await prisma.streakData.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currentStreak: 3,
      longestStreak: 7,
      totalPosts: 15,
      lastPostDate: new Date(),
    },
  });

  // Create sample posts
  const categories = ['FAMILY', 'WORK', 'SMALL_JOYS', 'NATURE', 'HEALTH', 'OTHER'];
  const samplePosts = [
    { content: 'Grateful for a wonderful family dinner tonight.', feeling: 'Warm and loved', category: 'FAMILY', visibility: 'PUBLIC' },
    { content: 'My team shipped a big feature today!', feeling: 'Accomplished', category: 'WORK', visibility: 'PUBLIC' },
    { content: 'The morning coffee was perfect today.', feeling: 'Content', category: 'SMALL_JOYS', visibility: 'PUBLIC' },
    { content: 'Beautiful sunset on my evening walk.', feeling: 'Peaceful', category: 'NATURE', visibility: 'PUBLIC' },
    { content: 'Completed my first 5K run!', feeling: 'Proud', category: 'HEALTH', visibility: 'ANONYMOUS' },
    { content: 'A stranger held the door for me today.', feeling: 'Grateful', category: 'OTHER', visibility: 'PRIVATE' },
  ];

  for (const post of samplePosts) {
    await prisma.gratitudePost.create({
      data: {
        ...post,
        authorId: user.id,
      },
    });
  }

  console.log(`Created ${samplePosts.length} sample posts`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
