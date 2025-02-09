const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let authToken;
let testUser;

beforeAll(async () => {
  // Создаем тестового пользователя и получаем токен
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    });

  authToken = registerResponse.body.token;
  testUser = registerResponse.body.user;
});

describe('Client Endpoints', () => {
  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'client@example.com',
          phone: '+1234567890',
          type: 'INDIVIDUAL',
          clientType: 'CUSTOMER',
          code: 'CLI001',
          vat_code: 'VAT001'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Client');
      expect(res.body).toHaveProperty('email', 'client@example.com');
    });

    it('should not create client without authentication', async () => {
      const res = await request(app)
        .post('/api/clients')
        .send({
          name: 'Test Client',
          email: 'client@example.com'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Создаем тестового клиента перед каждым тестом
      await prisma.clients.create({
        data: {
          name: 'Test Client',
          email: 'client@example.com',
          phone: '+1234567890',
          type: 'INDIVIDUAL',
          clientType: 'CUSTOMER',
          code: 'CLI001',
          vat_code: 'VAT001',
          user_id: testUser.id
        }
      });
    });

    it('should get all clients', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get client by id', async () => {
      const client = await prisma.clients.findFirst({
        where: { user_id: testUser.id }
      });

      const res = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', client.id);
    });
  });

  describe('PUT /api/clients/:id', () => {
    let testClient;

    beforeEach(async () => {
      testClient = await prisma.clients.create({
        data: {
          name: 'Test Client',
          email: 'client@example.com',
          phone: '+1234567890',
          type: 'INDIVIDUAL',
          clientType: 'CUSTOMER',
          code: 'CLI001',
          vat_code: 'VAT001',
          user_id: testUser.id
        }
      });
    });

    it('should update client', async () => {
      const res = await request(app)
        .put(`/api/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Client Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Client updated successfully');
    });
  });
}); 