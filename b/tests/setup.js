const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  console.log('Connecting to database...');
  await prisma.();
});

afterAll(async () => {
  console.log('Disconnecting from database...');
  await prisma.();
});

module.exports = prisma;
