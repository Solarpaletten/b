const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

async function scanDatabase() {
  try {
    console.log('\n=== 🔍 Сканирование базы данных Solar ===\n');

    // Детальный просмотр пользователей
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log('👥 Пользователи:');
    console.log('----------------------------------------');
    users.forEach((user) => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Имя: ${user.username}`);
      console.log(`Роль: ${user.role}`);
      console.log(`Статус: ${user.status}`);
      console.log(`Создан: ${user.created_at}`);
      console.log('----------------------------------------');
    });
    console.log(`Всего пользователей: ${users.length}`);

    // Детальный просмотр клиентов
    const clients = await prisma.clients.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        code: true,
        vat_code: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log('\n🏢 Клиенты:');
    console.log('----------------------------------------');
    clients.forEach((client) => {
      console.log(`ID: ${client.id}`);
      console.log(`Название: ${client.name}`);
      console.log(`Email: ${client.email}`);
      console.log(`Телефон: ${client.phone || 'Не указан'}`);
      console.log(`Роль: ${client.role}`);
      console.log(`Статус: ${client.is_active ? 'Активный' : 'Неактивный'}`);
      console.log(`Код: ${client.code || 'Не указан'}`);
      console.log(`VAT: ${client.vat_code || 'Не указан'}`);
      console.log(`Создан: ${client.created_at}`);
      console.log('----------------------------------------');
    });
    console.log(`Всего клиентов: ${clients.length}`);

    // Продажи и покупки
    const salesCount = await prisma.sales.count();
    const purchasesCount = await prisma.purchases.count();

    console.log('\n💰 Транзакции:');
    console.log(`Продажи: ${salesCount}`);
    console.log(`Покупки: ${purchasesCount}`);

    // Склады
    const warehousesCount = await prisma.warehouses.count();
    const warehousesByStatus = await prisma.warehouses.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\n🏭 Склады:');
    console.log(`Всего: ${warehousesCount}`);
    warehousesByStatus.forEach((status) => {
      console.log(`${status.status}: ${status._count}`);
    });

    // Продукты
    const productsCount = await prisma.products.count();
    const activeProducts = await prisma.products.count({
      where: { is_active: true },
    });

    console.log('\n📦 Продукты:');
    console.log(`Всего: ${productsCount}`);
    console.log(`Активных: ${activeProducts}`);

    // План счетов
    const accountsCount = await prisma.chart_of_accounts.count();
    console.log('\n📊 План счетов:');
    console.log(`Всего счетов: ${accountsCount}`);
  } catch (error) {
    logger.error('Ошибка сканирования:', error);
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Автозапуск при прямом вызове
if (require.main === module) {
  scanDatabase();
}

module.exports = scanDatabase;
