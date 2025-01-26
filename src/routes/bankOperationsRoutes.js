const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

// Получение списка банковских операций
router.get('/', async (req, res) => {
  try {
    const operations = await prismaManager.paginate('bank_operations', {
      page: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.perPage) || 10,
      where: {
        user_id: parseInt(req.query.userId),
        client_id: req.query.clientId ? parseInt(req.query.clientId) : undefined,
        type: req.query.type,
        date: {
          gte: req.query.startDate ? new Date(req.query.startDate) : undefined,
          lte: req.query.endDate ? new Date(req.query.endDate) : undefined
        }
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        users: {
          select: {
            username: true
          }
        },
        client: true
      }
    });
    res.json(operations);
  } catch (error) {
    logger.error('Error getting bank operations:', error);
    res.status(500).json({ error: 'Failed to get bank operations' });
  }
});

// Создание банковской операции
router.post('/', async (req, res) => {
  try {
    const operation = await prismaManager.prisma.bank_operations.create({
      data: {
        date: new Date(req.body.date),
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        type: req.body.type,
        account_id: parseInt(req.body.account_id),
        user_id: parseInt(req.body.user_id),
        client_id: req.body.client_id ? parseInt(req.body.client_id) : null
      },
      include: {
        users: {
          select: {
            username: true
          }
        },
        client: true
      }
    });
    res.status(201).json(operation);
  } catch (error) {
    logger.error('Error creating bank operation:', error);
    res.status(500).json({ error: 'Failed to create bank operation' });
  }
});

// Получение банковской операции по ID
router.get('/:id', async (req, res) => {
  try {
    const operation = await prismaManager.prisma.bank_operations.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users: {
          select: {
            username: true,
            email: true
          }
        },
        client: true
      }
    });
    if (!operation) {
      return res.status(404).json({ error: 'Bank operation not found' });
    }
    res.json(operation);
  } catch (error) {
    logger.error('Error getting bank operation:', error);
    res.status(500).json({ error: 'Failed to get bank operation' });
  }
});

// Обновление банковской операции
router.put('/:id', async (req, res) => {
  try {
    const operation = await prismaManager.prisma.bank_operations.update({
      where: { id: parseInt(req.params.id) },
      data: {
        date: new Date(req.body.date),
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        type: req.body.type,
        account_id: parseInt(req.body.account_id),
        client_id: req.body.client_id ? parseInt(req.body.client_id) : null
      }
    });
    res.json(operation);
  } catch (error) {
    logger.error('Error updating bank operation:', error);
    res.status(500).json({ error: 'Failed to update bank operation' });
  }
});

// Удаление банковской операции
router.delete('/:id', async (req, res) => {
  try {
    await prismaManager.prisma.bank_operations.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting bank operation:', error);
    res.status(500).json({ error: 'Failed to delete bank operation' });
  }
});

// Получение итогов по банковским операциям
router.get('/summary/total', async (req, res) => {
  try {
    const summary = await prismaManager.prisma.bank_operations.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      where: {
        user_id: parseInt(req.query.userId),
        date: {
          gte: req.query.startDate ? new Date(req.query.startDate) : undefined,
          lte: req.query.endDate ? new Date(req.query.endDate) : undefined
        }
      }
    });
    res.json(summary);
  } catch (error) {
    logger.error('Error getting bank operations summary:', error);
    res.status(500).json({ error: 'Failed to get bank operations summary' });
  }
});

module.exports = router; 