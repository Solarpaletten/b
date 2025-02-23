const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createChartOfAccounts() {
  try {
    const accounts = [
      {
        code: '1000',
        name: 'Cash',
        type: 'asset',
        account_type: 'current_asset',
        is_active: true,
        user_id: 1,
      },
      {
        code: '1100',
        name: 'Bank Account',
        type: 'asset',
        account_type: 'current_asset',
        is_active: true,
        user_id: 1,
      },
      {
        code: '2000',
        name: 'Accounts Receivable',
        type: 'asset',
        account_type: 'current_asset',
        is_active: true,
        user_id: 1,
      },
      {
        code: '3000',
        name: 'Inventory',
        type: 'asset',
        account_type: 'current_asset',
        is_active: true,
        user_id: 1,
      },
      {
        code: '4000',
        name: 'Accounts Payable',
        type: 'liability',
        account_type: 'current_liability',
        is_active: true,
        user_id: 1,
      },
      {
        code: '5000',
        name: 'Sales Revenue',
        type: 'revenue',
        account_type: 'income',
        is_active: true,
        user_id: 1,
      },
    ];

    for (const account of accounts) {
      const newAccount = await prisma.chart_of_accounts.create({
        data: account,
      });
      console.log('Создан новый счет:', newAccount);
    }
  } catch (error) {
    console.error('Ошибка при создании плана счетов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createChartOfAccounts();
