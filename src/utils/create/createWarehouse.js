const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWarehouse() {
  try {
    const newWarehouse = await prisma.warehouses.create({
      data: {
        name: 'Main Warehouse',
        code: 'WH001',
        address: '123 Storage Street',
        status: 'Active',
        client_id: 1, // ID нашего тестового клиента
        user_id: 1,   // ID админа
        responsible_person_id: 1 // ID админа как ответственного лица
      }
    });
    
    console.log('Создан новый склад:', newWarehouse);
  } catch (error) {
    console.error('Ошибка при создании склада:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWarehouse(); 