// tests/setup.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = require('../src/app');
const request = require('supertest');

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

global.app = app;
global.request = request;
global.prisma = prisma;

module.exports = { app, request, prisma };