const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager');
const { logger } = require('../config/logger');

// Получение списка счетов
router.get('/', async (req, res) => {
  try {
    const accounts = await prismaManager.paginate('chart_of_accounts', {
      page: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.perPage) || 10,
      where: {
        user_id: parseInt(req.query.userId),
        is_active: req.query.isActive === 'false' ? false : true,
        type: req.query.type,
        account_type: req.query.accountType,
        code: req.query.code ? { contains: req.query.code } : undefined
      },
      orderBy: {
        code: 'asc'
      },
      include: {
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.json(accounts);
  } catch (error) {
    logger.error('Error getting chart of accounts:', error);
    res.status(500).json({ error: 'Failed to get chart of accounts' });
  }
});

// Создание счета
router.post('/', async (req, res) => {
  try {
    const account = await prismaManager.prisma.chart_of_accounts.create({
      data: {
        code: req.body.code,
        name: req.body.name,
        type: req.body.type,
        account_type: req.body.account_type,
        parent_code: req.body.parent_code,
        is_active: true,
        user_id: parseInt(req.body.user_id)
      },
      include: {
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.status(201).json(account);
  } catch (error) {
    logger.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Получение счета по ID
router.get('/:id', async (req, res) => {
  try {
    const account = await prismaManager.prisma.chart_of_accounts.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    logger.error('Error getting account:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
});

// Обновление счета
router.put('/:id', async (req, res) => {
  try {
    const account = await prismaManager.prisma.chart_of_accounts.update({
      where: { id: parseInt(req.params.id) },
      data: {
        code: req.body.code,
        name: req.body.name,
        type: req.body.type,
        account_type: req.body.account_type,
        parent_code: req.body.parent_code,
        is_active: req.body.is_active
      }
    });
    res.json(account);
  } catch (error) {
    logger.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Удаление счета
router.delete('/:id', async (req, res) => {
  try {
    await prismaManager.prisma.chart_of_accounts.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Получение иерархии счетов
router.get('/hierarchy/all', async (req, res) => {
  try {
    const accounts = await prismaManager.prisma.chart_of_accounts.findMany({
      where: {
        user_id: parseInt(req.query.userId),
        is_active: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    // Построение иерархии
    const hierarchy = accounts.reduce((acc, account) => {
      if (!account.parent_code) {
        acc[account.code] = { ...account, children: {} };
      } else {
        const parent = accounts.find(a => a.code === account.parent_code);
        if (parent) {
          acc[parent.code].children[account.code] = { ...account, children: {} };
        }
      }
      return acc;
    }, {});

    res.json(hierarchy);
  } catch (error) {
    logger.error('Error getting accounts hierarchy:', error);
    res.status(500).json({ error: 'Failed to get accounts hierarchy' });
  }
});

module.exports = router; 