const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createClient() {
  try {
    const newClient = await prisma.clients.create({
      data: {
        name: 'Test Company',
        email: 'company@test.com',
        phone: '+1234567890',
        type: 'COMPANY',
        clientType: 'BOTH',
        code: 'TEST001',
        vat_code: 'VAT123456',
        user_id: 1, // ID нашего админа
        is_active: true // Boolean вместо строки
      }
    });
    
    console.log('Создан новый клиент:', newClient);
  } catch (error) {
    console.error('Ошибка при создании клиента:', error);
    // Выводим детали ошибки
    if (error.code) {
      console.error('Код ошибки:', error.code);
    }
    if (error.meta) {
      console.error('Мета:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createClient(); 