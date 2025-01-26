const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { logger } = require('../config/logger');
const prisma = new PrismaClient();

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
    const client = await prisma.clients.create({
      data: {
        ...req.body,
        user_id: req.user.id
      }
    });
    res.status(201).json(client);
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Обновление клиента
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await prisma.clients.update({
      where: {
        id: parseInt(req.params.id),
        user_id: req.user.id
      },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Удаление клиента
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.clients.delete({
      where: {
        id: parseInt(req.params.id),
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