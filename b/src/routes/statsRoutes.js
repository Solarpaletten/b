const express = require('express');
const router = express.Router();
const prismaManager = require('../utils/create/prismaManager');

// Общая статистика базы данных
router.get('/database-stats', async (req, res) => {
  try {
    const totalStats = {
      clients: await prismaManager.prisma.clients.count(),
      products: await prismaManager.prisma.products.count(),
      sales: await prismaManager.prisma.sales.count(),
      purchases: await prismaManager.prisma.purchases.count(),
      bankOperations: await prismaManager.prisma.bank_operations.count(),
      warehouses: await prismaManager.prisma.warehouses.count(),
      chartOfAccounts: await prismaManager.prisma.chart_of_accounts.count(),
      docSettlements: await prismaManager.prisma.doc_settlement.count()
    };

    const tables = Object.entries(totalStats).map(([name, count]) => ({
      name,
      recordCount: count
    }));

    res.json({
      connected: true,
      tables,
      totalStats
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      connected: false,
      error: 'Failed to fetch statistics' 
    });
  }
});

// Статистика по продажам
router.get('/sales-stats', async (req, res) => {
  try {
    const salesStats = await prismaManager.prisma.sales.groupBy({
      by: ['status'],
      _count: true
    });
    res.json(salesStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales statistics' });
  }
});

// Статистика по закупкам
router.get('/purchase-stats', async (req, res) => {
  try {
    const purchaseStats = await prismaManager.prisma.purchases.groupBy({
      by: ['status'],
      _count: true
    });
    res.json(purchaseStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase statistics' });
  }
});

// Банковские операции
router.get('/bank-stats', async (req, res) => {
  try {
    const bankStats = await prismaManager.prisma.bank_operations.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      }
    });
    res.json(bankStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank statistics' });
  }
});

// Складская статистика
router.get('/warehouse-stats', async (req, res) => {
  try {
    const warehouseStats = await prismaManager.prisma.warehouses.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    res.json(warehouseStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse statistics' });
  }
});

// Топ клиентов
router.get('/top-clients', async (req, res) => {
  try {
    const topClients = await prismaManager.prisma.clients.findMany({
      take: 5,
      include: {
        sales: {
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: {
        sales: {
          _count: 'desc'
        }
      }
    });
    res.json(topClients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top clients' });
  }
});

// Финансовая сводка
router.get('/financial-summary', async (req, res) => {
  try {
    const summary = {
      totalSales: await prismaManager.prisma.sales.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      totalPurchases: await prismaManager.prisma.purchases.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      bankBalance: await prismaManager.prisma.bank_operations.aggregate({
        _sum: {
          amount: true
        }
      })
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Статистика по документам
router.get('/documents-summary', async (req, res) => {
  try {
    const summary = {
      salesDocuments: await prismaManager.prisma.sales.groupBy({
        by: ['status'],
        _count: true
      }),
      purchaseDocuments: await prismaManager.prisma.purchases.groupBy({
        by: ['status'],
        _count: true
      }),
      settlementDocuments: await prismaManager.prisma.doc_settlement.groupBy({
        by: ['status'],
        _count: true
      })
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents summary' });
  }
});

// Детальная складская статистика
router.get('/warehouse-detailed', async (req, res) => {
  try {
    const warehouseStats = await prismaManager.prisma.warehouses.findMany({
      include: {
        products: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        responsible_person: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    
    const formattedStats = warehouseStats.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      responsiblePerson: warehouse.responsible_person,
      totalProducts: warehouse.products.length,
      totalValue: warehouse.products.reduce((sum, item) => 
        sum + (item.quantity * item.product.price), 0),
      productsSummary: warehouse.products.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        value: item.quantity * item.product.price
      }))
    }));
    
    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch detailed warehouse statistics' });
  }
});

module.exports = router;