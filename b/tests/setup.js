// tests/setup.js
const { jest } = require('@jest/globals');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Глобальные переменные для тестов
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.describe = describe;
global.it = it;
global.expect = expect;
global.prisma = prisma;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Очистка моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});