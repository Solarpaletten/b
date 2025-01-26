const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const newUser = await prisma.users.create({
      data: {
        email: 'solar@solar.pl',
        password_hash: '$2a$10$NM8jpTwsWt.Ykyr6xyMMV.LEK397juWp/2saltNUsaQChCTdTKriq',
        username: 'solar',
        role: 'admin'
      }
    });
    
    console.log('Создан новый пользователь:', newUser);
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 