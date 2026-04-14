import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.scenarioRun.create({
    data: {
      scenario: 'healthy_request',
      status: 'seed',
      message: 'Seed data for Signal Lab'
    }
  });
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
