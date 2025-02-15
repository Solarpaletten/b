const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

jest.setTimeout(60000);

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
      ]);

const registerResponse = await request(app)
  .post('/api/auth/register')
  .send({
    email: `solar${Date.now()}@solar.pl`,
    password: 'pass123',
    username: `solar${Date.now()}`
  });

  testUser = registerResponse.body.user;
  authToken = registerResponse.body.token;

  if (!testUser || !authToken) {
    throw new Error('Failed to register test user');
  }

  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  }

  }, 30000);


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
      vat_code: 'VAT001',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Test Client');
    expect(res.body).toHaveProperty('email', 'client@example.com');

    });

    test('should get all clients', async () => {
      // Получение всех клиентов
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'client@example.com',
          code: 'CLI001',
          vat_code: 'VAT001',
        });

      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);

    });

    test('should get a client by id', async () => {
      // Сначала создаем клиента через API
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'client@example.com',
          code: 'CLI001',
          vat_code: 'VAT001',
        });

      expect(createResponse.statusCode).toBe(201);
      const client = createResponse.body;

      // Теперь пытаемся получить созданного клиента
      const res = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', client.id);
    });

    test('should update a client', async () => {
      // Создаем клиента через API
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'client@example.com',
          code: 'CLI001',
          vat_code: 'VAT001',
        });

      expect(createResponse.statusCode).toBe(201);
      const client = createResponse.body;

      // Теперь обновляем созданного клиента
      const res = await request(app)
        .put(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Client'
        });

      expect(res.statusCode).toBe(200);
      expect(typeof res.body === 'object').toBeTruthy();
      expect(res.body).toHaveProperty('name', 'Updated Client');
    });
});