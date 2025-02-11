const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.setTimeout(30000);

describe('Client Endpoints', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    try {
      // Очистка БД
      await prisma.$transaction([
        prisma.doc_settlement.deleteMany({}),
        prisma.sales.deleteMany({}),
        prisma.purchases.deleteMany({}),
        prisma.clients.deleteMany({}),
        prisma.products.deleteMany({}),
        prisma.chart_of_accounts.deleteMany({}),
        prisma.bank_operations.deleteMany({}),
        prisma.warehouses.deleteMany({}),
        prisma.users.deleteMany({})
      ]);

      // Создаем тестового пользователя
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`, // Уникальный email
          password: 'password123',
          username: `testuser${Date.now()}` // Уникальный username
        });

      testUser = registerResponse.body.user;
      authToken = registerResponse.body.token;

      if (!testUser || !authToken) {
        throw new Error('Test user or auth token not found');
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }, 10000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create a new client', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Client',
        email: 'client@example.com',
        code: 'CLI001',
        vat_code: 'VAT001'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Client');
    expect(res.body).toHaveProperty('email', 'client@example.com');
  });

  test('should get all clients', async () => {
    // Создаем тестового клиента
    await prisma.clients.create({
      data: {
        name: 'Test Client',
        email: 'client@example.com',
        code: 'CLI001',
        vat_code: 'VAT001',
        user_id: testUser.id
      }
    });

    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
  });

  test('should get client by id', async () => {
    const client = await prisma.clients.create({
      data: {
        name: 'Test Client',
        email: 'client@example.com',
        code: 'CLI001',
        vat_code: 'VAT001',
        user_id: testUser.id
      }
    });

    const res = await request(app)
      .get(`/api/clients/${client.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', client.id);
  });

  test('should update client', async () => {
    const client = await prisma.clients.create({
      data: {
        name: 'Test Client',
        email: 'client@example.com',
        code: 'CLI001',
        vat_code: 'VAT001',
        user_id: testUser.id
      }
    });

    const res = await request(app)
      .put(`/api/clients/${client.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Client'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Client');
  });
});