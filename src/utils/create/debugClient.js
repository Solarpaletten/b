const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugClient() {
  try {
    console.log('\n=== Отладка создания клиента ===\n');

    // 1. Проверяем существующих клиентов
    console.log('1. Проверка существующих клиентов:');
    const existingClients = await prisma.clients.findMany();
    console.log('Количество клиентов:', existingClients.length);
    console.log('Существующие клиенты:', JSON.stringify(existingClients, null, 2));

    // 2. Пробуем создать нового клиента с подробным логированием
    console.log('\n2. Попытка создания нового клиента:');
    const clientData = {
      name: 'Test Company',
      email: 'company@test.com',
      phone: '+1234567890',
      type: 'COMPANY',
      clientType: 'BOTH',
      code: 'TEST001',
      vat_code: 'VAT123456',
      user_id: 1,
      is_active: true
    };
    console.log('Данные для создания:', JSON.stringify(clientData, null, 2));

    const newClient = await prisma.clients.create({
      data: clientData
    });
    console.log('Результат создания:', JSON.stringify(newClient, null, 2));

  } catch (error) {
    console.error('\n=== Ошибка при отладке ===');
    console.error('Тип ошибки:', error.constructor.name);
    console.error('Сообщение:', error.message);
    if (error.code) {
      console.error('Код ошибки:', error.code);
    }
    if (error.meta) {
      console.error('Метаданные:', error.meta);
    }
    console.error('Полный стек ошибки:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugClient(); 