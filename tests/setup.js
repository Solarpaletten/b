const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Очистка тестовой базы данных перед тестами
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Очистка всех таблиц перед каждым тестом
  const tables = ['users', 'clients', 'products', 'sales', 'purchases', 'warehouses', 'bank_operations', 'chart_of_accounts', 'doc_settlement'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}); 