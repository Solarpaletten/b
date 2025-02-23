const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProducts() {
  try {
    const products = [
      {
        code: 'PROD001',
        name: 'Solar Panel 400W',
        description: 'High efficiency solar panel, 400W output',
        unit: 'pcs',
        price: 299.99,
        currency: 'EUR',
        user_id: 1,
      },
      {
        code: 'PROD002',
        name: 'Inverter 5kW',
        description: 'Solar inverter, 5kW capacity',
        unit: 'pcs',
        price: 899.99,
        currency: 'EUR',
        user_id: 1,
      },
      {
        code: 'PROD003',
        name: 'Battery 48V',
        description: 'Lithium battery, 48V system',
        unit: 'pcs',
        price: 2499.99,
        currency: 'EUR',
        user_id: 1,
      },
    ];

    for (const product of products) {
      const newProduct = await prisma.products.create({
        data: product,
      });
      console.log('Создан новый продукт:', newProduct);
    }
  } catch (error) {
    console.error('Ошибка при создании продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProducts();
