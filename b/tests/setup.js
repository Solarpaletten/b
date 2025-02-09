// tests/setup.js
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Нет необходимости объявлять jest и глобальные переменные,
// они уже доступны в тестовом окружении
beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Database disconnect error:', error);
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

// Экспортируем prisma для использования в тестах
module.exports = prisma;