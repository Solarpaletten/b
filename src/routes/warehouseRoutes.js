const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

// Получение списка складов
router.get('/', async (req, res) => {
  try {
    const warehouses = await prismaManager.paginate('warehouses', {
      page: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.perPage) || 10,
      where: {
        user_id: parseInt(req.query.userId),
        client_id: req.query.clientId ? parseInt(req.query.clientId) : undefined,
        status: req.query.status
      },
      include: {
        users: {
          select: {
            username: true,
            email: true
          }
        },
        responsible_person: {
          select: {
            username: true,
            email: true
          }
        },
        client: true
      }
    });
    res.json(warehouses);
  } catch (error) {
    logger.error('Error getting warehouses:', error);
    res.status(500).json({ error: 'Failed to get warehouses' });
  }
});

// Создание склада
router.post('/', async (req, res) => {
  try {
    const warehouse = await prismaManager.prisma.warehouses.create({
      data: {
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        status: req.body.status || 'Active',
        client_id: req.body.client_id ? parseInt(req.body.client_id) : null,
        user_id: parseInt(req.body.user_id),
        responsible_person_id: req.body.responsible_person_id ? 
          parseInt(req.body.responsible_person_id) : null
      },
      include: {
        users: {
          select: {
            username: true,
            email: true
          }
        },
        responsible_person: {
          select: {
            username: true,
            email: true
          }
        },
        client: true
      }
    });
    res.status(201).json(warehouse);
  } catch (error) {
    logger.error('Error creating warehouse:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// Получение склада по ID
router.get('/:id', async (req, res) => {
  try {
    const warehouse = await prismaManager.prisma.warehouses.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users: {
          select: {
            username: true,
            email: true
          }
        },
        responsible_person: {
          select: {
            username: true,
            email: true
          }
        },
        client: true,
        sales: true,
        purchases: true
      }
    });
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    res.json(warehouse);
  } catch (error) {
    logger.error('Error getting warehouse:', error);
    res.status(500).json({ error: 'Failed to get warehouse' });
  }
});

// Обновление склада
router.put('/:id', async (req, res) => {
  try {
    const warehouse = await prismaManager.prisma.warehouses.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        status: req.body.status,
        client_id: req.body.client_id ? parseInt(req.body.client_id) : null,
        responsible_person_id: req.body.responsible_person_id ? 
          parseInt(req.body.responsible_person_id) : null
      }
    });
    res.json(warehouse);
  } catch (error) {
    logger.error('Error updating warehouse:', error);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// Удаление склада
router.delete('/:id', async (req, res) => {
  try {
    await prismaManager.prisma.warehouses.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting warehouse:', error);
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

// Получение статистики по складу
router.get('/:id/stats', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const [sales, purchases] = await prismaManager.transaction([
      prismaManager.prisma.sales.aggregate({
        where: { warehouse_id: warehouseId },
        _sum: { total_amount: true },
        _count: true
      }),
      prismaManager.prisma.purchases.aggregate({
        where: { warehouse_id: warehouseId },
        _sum: { total_amount: true },
        _count: true
      })
    ]);

    res.json({
      sales: {
        count: sales._count,
        totalAmount: sales._sum.total_amount
      },
      purchases: {
        count: purchases._count,
        totalAmount: purchases._sum.total_amount
      }
    });
  } catch (error) {
    logger.error('Error getting warehouse stats:', error);
    res.status(500).json({ error: 'Failed to get warehouse statistics' });
  }
});

module.exports = router; 