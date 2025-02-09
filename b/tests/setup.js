// tests/setup.js
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.test' });
const { beforeAll, afterAll, beforeEach } = require('@jest/globals');

global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  const tables = ['users', 'clients', 'products', 'sales', 'purchases', 'warehouses', 'bank_operations', 'chart_of_accounts', 'doc_settlement'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});