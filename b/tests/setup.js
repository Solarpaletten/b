// tests/setup.js
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');
const request = require('supertest');
const { beforeAll, afterAll, beforeEach } = require('@jest/globals');
const { jest, beforeAll, afterAll, beforeEach } = require('@jest/globals');

const prisma = new PrismaClient();

// Не запускаем сервер во время тестов
jest.mock('../src/app', () => {
  const express = require('express');
  const app = express();
  return app;
});

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