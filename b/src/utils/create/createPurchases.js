const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPurchases() {
  try {
    const purchases = [
      {
        doc_number: 'PO-2025-001',
        doc_date: new Date('2025-01-26'),
        purchase_date: new Date('2025-01-26'),
        user_id: 1,
        client_id: 1,
        warehouse_id: 1,
        total_amount: 5000.0,
        currency: 'EUR',
        status: 'completed',
        invoice_type: 'standard',
        invoice_number: 'SUP-2025-001',
        vat_rate: 20.0,
      },
      {
        doc_number: 'PO-2025-002',
        doc_date: new Date('2025-01-26'),
        purchase_date: new Date('2025-01-26'),
        user_id: 1,
        client_id: 1,
        warehouse_id: 1,
        total_amount: 3500.0,
        currency: 'EUR',
        status: 'completed',
        invoice_type: 'standard',
        invoice_number: 'SUP-2025-002',
        vat_rate: 20.0,
      },
    ];

    for (const purchase of purchases) {
      const newPurchase = await prisma.purchases.create({
        data: purchase,
      });
      console.log('Создана новая закупка:', newPurchase);
    }
  } catch (error) {
    console.error('Ошибка при создании закупок:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPurchases();
