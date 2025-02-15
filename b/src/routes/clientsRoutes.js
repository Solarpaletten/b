const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { logger } = require('../config/logger');
const prisma = new PrismaClient();

// POST /api/clients/create-user-and-client - Создание пользователя и клиента
router.post('/create-user-and-client', async (req, res) => {
  try {
    const { email, password, client } = req.body;

    if (!email || !password || !client) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Создание пользователя
    const user = await prisma.users.create({
      data: {
        email,
        password, // Убедитесь, что пароль хешируется перед сохранением
      },
    });

    // Создание клиента с привязкой к пользователю
    const newClient = await prisma.clients.create({
      data: {
        ...client,
        user_id: user.id,
      },
    });

    res.status(201).json({
      message: 'User and Client created successfully',
      user,
      client: newClient,
    });
  } catch (error) {
    logger.error('Error creating user and client:', error);
    res.status(500).json({ error: 'Failed to create user and client' });
  }
});

// GET /api/clients - Получение всех клиентов
router.get('/', auth, async (req, res) => {
  try {
    const clients = await prisma.clients.findMany({
      where: {
        user_id: req.user.id
      }
    });
    res.json(clients);
  } catch (error) {
    logger.error('Error getting clients:', error);
    res.status(500).json({ error: 'Failed to get clients' });
  }
});

// GET /api/clients/:id - Получение клиента по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await prisma.clients.findFirst({
      where: {
        id: parseInt(req.params.id),
        user_id: req.user.id
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    logger.error('Error getting client:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
});

// POST /api/clients - Создание нового клиента
router.post('/', auth, async (req, res) => {
  try {
    // Проверяем существование пользователя
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Создаем клиента с проверенным user_id
    const client = await prisma.clients.create({
      data: {
        ...req.body,
        user_id: req.user.id
      }
    });

    res.status(201).json(client);
  } catch (error) {
    logger.error('Error creating client:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid user reference' });
    }
    
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Обновление клиента
router.put('/:id', auth, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);

    // Проверяем существование клиента и принадлежность текущему пользователю
    const existingClient = await prisma.clients.findFirst({
      where: { 
        id: clientId,
        user_id: req.user.id 
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Обновляем клиента
    const updatedClient = await prisma.clients.update({
      where: { 
        id: clientId,
        user_id: req.user.id
      },
      data: req.body,
    });

    res.json(updatedClient);
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Удаление клиента
router.delete('/:id', auth, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);

    // Проверяем существование клиента
    const existingClient = await prisma.clients.findFirst({
      where: {
        id: clientId,
        user_id: req.user.id
      }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.clients.delete({
      where: {
        id: clientId,
        user_id: req.user.id
      }
    });
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;