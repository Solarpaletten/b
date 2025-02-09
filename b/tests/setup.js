//Users/tlnc/Documents/solar/s/b/tests/setup.js 
require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Глобальная переменная для тестов
global.prisma = prisma;

// Отключаем выход из процесса во время тестов
process.exit = jest.fn();

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://solar_user:PWO1lclgDswIAhL7OV1zBKGglUeTPmuf@dpg-cs4khfrtq21c73fve2j0-a.oregon-postgres.render.com/solar_eat1_test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test_password';

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