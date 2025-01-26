const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

// Получение списка закупок
router.get('/', async (req, res) => {
  try {
    const purchases = await prismaManager.paginate('purchases', {
      page: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.perPage) || 10,
      where: {
        user_id: parseInt(req.query.userId),
        client_id: req.query.clientId ? parseInt(req.query.clientId) : undefined,
        warehouse_id: req.query.warehouseId ? parseInt(req.query.warehouseId) : undefined,
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
        warehouse: true,
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.json(purchases);
  } catch (error) {
    logger.error('Error getting purchases:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Создание закупки
router.post('/', async (req, res) => {
  try {
    const purchase = await prismaManager.prisma.purchases.create({
      data: {
        doc_number: req.body.doc_number,
        doc_date: new Date(req.body.doc_date),
        purchase_date: req.body.purchase_date ? new Date(req.body.purchase_date) : null,
        user_id: parseInt(req.body.user_id),
        client_id: parseInt(req.body.client_id),
        warehouse_id: parseInt(req.body.warehouse_id),
        total_amount: parseFloat(req.body.total_amount),
        currency: req.body.currency,
        status: req.body.status || 'draft',
        invoice_type: req.body.invoice_type,
        invoice_number: req.body.invoice_number,
        vat_rate: req.body.vat_rate ? parseFloat(req.body.vat_rate) : null
      },
      include: {
        client: true,
        warehouse: true,
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.status(201).json(purchase);
  } catch (error) {
    logger.error('Error creating purchase:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Получение закупки по ID
router.get('/:id', async (req, res) => {
  try {
    const purchase = await prismaManager.prisma.purchases.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        client: true,
        warehouse: true,
        users: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    logger.error('Error getting purchase:', error);
    res.status(500).json({ error: 'Failed to get purchase' });
  }
});

// Обновление закупки
router.put('/:id', async (req, res) => {
  try {
    const purchase = await prismaManager.prisma.purchases.update({
      where: { id: parseInt(req.params.id) },
      data: {
        doc_number: req.body.doc_number,
        doc_date: new Date(req.body.doc_date),
        purchase_date: req.body.purchase_date ? new Date(req.body.purchase_date) : null,
        client_id: parseInt(req.body.client_id),
        warehouse_id: parseInt(req.body.warehouse_id),
        total_amount: parseFloat(req.body.total_amount),
        currency: req.body.currency,
        status: req.body.status,
        invoice_type: req.body.invoice_type,
        invoice_number: req.body.invoice_number,
        vat_rate: req.body.vat_rate ? parseFloat(req.body.vat_rate) : null
      }
    });
    res.json(purchase);
  } catch (error) {
    logger.error('Error updating purchase:', error);
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// Удаление закупки
router.delete('/:id', async (req, res) => {
  try {
    await prismaManager.prisma.purchases.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting purchase:', error);
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

// Изменение статуса закупки
router.patch('/:id/status', async (req, res) => {
  try {
    const purchase = await prismaManager.prisma.purchases.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: req.body.status
      }
    });
    res.json(purchase);
  } catch (error) {
    logger.error('Error updating purchase status:', error);
    res.status(500).json({ error: 'Failed to update purchase status' });
  }
});

module.exports = router; 