const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSales() {
  try {
    const sales = [
      {
        doc_number: 'INV-2025-001',
        doc_date: new Date('2025-01-26'),
        sale_date: new Date('2025-01-26'),
        user_id: 1,
        client_id: 1,
        warehouse_id: 1,
        total_amount: 3899.89,
        currency: 'EUR',
        status: 'completed',
        invoice_type: 'standard',
        invoice_number: 'INV-2025-001',
        vat_rate: 20.00
      },
      {
        doc_number: 'INV-2025-002',
        doc_date: new Date('2025-01-26'),
        sale_date: new Date('2025-01-26'),
        user_id: 1,
        client_id: 1,
        warehouse_id: 1,
        total_amount: 2499.99,
        currency: 'EUR',
        status: 'completed',
        invoice_type: 'standard',
        invoice_number: 'INV-2025-002',
        vat_rate: 20.00
      }
    ];

    for (const sale of sales) {
      const newSale = await prisma.sales.create({
        data: sale
      });
      console.log('Создана новая продажа:', newSale);
    }

  } catch (error) {
    console.error('Ошибка при создании продаж:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSales(); 