const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

// Получение списка документов расчетов
router.get('/', async (req, res) => {
  try {
    const settlements = await prismaManager.paginate('doc_settlement', {
      page: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.perPage) || 10,
      where: {
        user_id: parseInt(req.query.userId),
        client_id: req.query.clientId ? parseInt(req.query.clientId) : undefined,
        status: req.query.status,
        doc_date: {
          gte: req.query.startDate ? new Date(req.query.startDate) : undefined,
          lte: req.query.endDate ? new Date(req.query.endDate) : undefined
        }
      },
      orderBy: {
        doc_date: 'desc'
      },
      include: {
        client: true,
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.json(settlements);
  } catch (error) {
    logger.error('Error getting settlements:', error);
    res.status(500).json({ error: 'Failed to get settlements' });
  }
});

// Создание документа расчета
router.post('/', async (req, res) => {
  try {
    const settlement = await prismaManager.prisma.doc_settlement.create({
      data: {
        doc_number: req.body.doc_number,
        doc_date: new Date(req.body.doc_date),
        client_id: parseInt(req.body.client_id),
        status: req.body.status || 'draft',
        amount: parseFloat(req.body.amount),
        period_start: new Date(req.body.period_start),
        period_end: new Date(req.body.period_end),
        user_id: parseInt(req.body.user_id)
      },
      include: {
        client: true,
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.status(201).json(settlement);
  } catch (error) {
    logger.error('Error creating settlement:', error);
    res.status(500).json({ error: 'Failed to create settlement' });
  }
});

// Получение документа расчета по ID
router.get('/:id', async (req, res) => {
  try {
    const settlement = await prismaManager.prisma.doc_settlement.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        client: true,
        users: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    res.json(settlement);
  } catch (error) {
    logger.error('Error getting settlement:', error);
    res.status(500).json({ error: 'Failed to get settlement' });
  }
});

// Обновление документа расчета
router.put('/:id', async (req, res) => {
  try {
    const settlement = await prismaManager.prisma.doc_settlement.update({
      where: { id: parseInt(req.params.id) },
      data: {
        doc_number: req.body.doc_number,
        doc_date: new Date(req.body.doc_date),
        client_id: parseInt(req.body.client_id),
        status: req.body.status,
        amount: parseFloat(req.body.amount),
        period_start: new Date(req.body.period_start),
        period_end: new Date(req.body.period_end)
      }
    });
    res.json(settlement);
  } catch (error) {
    logger.error('Error updating settlement:', error);
    res.status(500).json({ error: 'Failed to update settlement' });
  }
});

// Удаление документа расчета
router.delete('/:id', async (req, res) => {
  try {
    await prismaManager.prisma.doc_settlement.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting settlement:', error);
    res.status(500).json({ error: 'Failed to delete settlement' });
  }
});

// Изменение статуса документа расчета
router.patch('/:id/status', async (req, res) => {
  try {
    const settlement = await prismaManager.prisma.doc_settlement.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: req.body.status
      }
    });
    res.json(settlement);
  } catch (error) {
    logger.error('Error updating settlement status:', error);
    res.status(500).json({ error: 'Failed to update settlement status' });
  }
});

module.exports = router; 