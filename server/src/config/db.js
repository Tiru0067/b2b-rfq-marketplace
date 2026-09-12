import { PrismaClient } from '@prisma/client';

// Create one shared database connection instance for the app
const prisma = new PrismaClient();

export default prisma;
