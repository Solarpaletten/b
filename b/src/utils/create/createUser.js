const { PrismaClient } = require('@prisma/client');
const prismaManager = require('./prismaManager');

async function createUser() {
  try {
    const newUser = await prismaManager.prisma.users.create({
      data: {
        email: 'solar2@solar.pl',
        password_hash: '$2a$10$dx8SXrT3w9XboQ1p0vk1/.dFrSL921YPFZ/ILw4lWL4BJjdwJWtuS',
        username: 'solar',
        role: 'ADMIN',
        email_verified: true, // изменено с is_verified
        status: 'ACTIVE' // вместо is_active используем status
      }
    });
    
    console.log('Создан новый пользователь:', newUser);
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
  } finally {
    await prismaManager.prisma.$disconnect(); // исправлено с prisma на prismaManager.prisma
  }
}

createUser();