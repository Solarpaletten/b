const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBankOperations() {
  try {
    const operations = [
      {
        date: new Date('2025-01-26'),
        description: 'Initial bank deposit',
        amount: 10000.00,
        type: 'credit',
        account_id: 2, // Bank Account (1100)
        user_id: 1,
        client_id: 1
      },
      {
        date: new Date('2025-01-26'),
        description: 'Payment for solar panels',
        amount: 2999.90,
        type: 'credit',
        account_id: 2, // Bank Account (1100)
        user_id: 1,
        client_id: 1
      },
      {
        date: new Date('2025-01-26'),
        description: 'Payment for inverter',
        amount: 899.99,
        type: 'credit',
        account_id: 2, // Bank Account (1100)
        user_id: 1,
        client_id: 1
      }
    ];

    for (const operation of operations) {
      const newOperation = await prisma.bank_operations.create({
        data: operation
      });
      console.log('Создана новая банковская операция:', newOperation);
    }

  } catch (error) {
    console.error('Ошибка при создании банковских операций:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBankOperations(); 