import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connection established');
  } catch (error) {
    console.error('Unable to connect to the database', error);
    throw error;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
