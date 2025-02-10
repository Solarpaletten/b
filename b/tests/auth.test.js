// auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.sales.deleteMany({}),
      prisma.purchases.deleteMany({}),
      prisma.clients.deleteMany({}),
      prisma.products.deleteMany({}),
      prisma.chart_of_accounts.deleteMany({}),
      prisma.bank_operations.deleteMany({}),
      prisma.warehouses.deleteMany({}),
      prisma.doc_settlement.deleteMany({}),
      prisma.users.deleteMany({})
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user.role).toBe('USER');
  });

  it('should not create user with existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser2'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  describe('POST /api/auth/login', () => {
    let user;

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      user = registerRes.body.user;
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });
    });

    it('should send reset password instructions', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      const user = await prisma.users.findUnique({
        where: { email: 'test@example.com' }
      });

      resetToken = user.reset_token;
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});