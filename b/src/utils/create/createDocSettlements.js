const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDocSettlements() {
  try {
    const settlements = [
      {
        doc_number: 'ACT-2025-001',
        doc_date: new Date('2025-01-26'),
        client_id: 1,
        status: 'completed',
        amount: 8500.0,
        period_start: new Date('2025-01-01'),
        period_end: new Date('2025-01-31'),
        user_id: 1,
      },
      {
        doc_number: 'ACT-2025-002',
        doc_date: new Date('2025-01-26'),
        client_id: 1,
        status: 'draft',
        amount: 6399.88,
        period_start: new Date('2025-01-01'),
        period_end: new Date('2025-01-31'),
        user_id: 1,
      },
    ];

    for (const settlement of settlements) {
      const newSettlement = await prisma.doc_settlement.create({
        data: settlement,
      });
      console.log('Создан новый акт сверки:', newSettlement);
    }
  } catch (error) {
    console.error('Ошибка при создании актов сверки:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDocSettlements();
