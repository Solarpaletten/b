const { PrismaClient } = require('@prisma/client');
const prismaManager = require('./prismaManager');

async function createUser() {
  try {
    const newUser = await prismaManager.prisma.users.create({
      data: {
        email: 'solar2@solar.pl',
        password_hash: '$2a$10$Oolo3IFkBwjpU.pleG4JPOSjZShksma.M9HkX8e.GxiKCHfjjG6bG',
        username: 'solar',
        role: 'admin',
        email_verified: true, // изменено с is_verified
        status: 'active' // вместо is_active используем status
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