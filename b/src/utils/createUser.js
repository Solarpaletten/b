const { PrismaClient } = require('@prisma/client');
const prismaManager = require('./create/prismaManager');

async function createUser() {
  try {
    const newUser = await prismaManager.prisma.users.create({
      data: {
        email: 'solar@solar.pl',
        password_hash: '$2a$10$R2OXiwJOy3hLaNr9Kf0eoOKMQJ3NAiKs9qbAyIgkqrUkHfmxdjEfi',
        username: 'solar',
        role: 'ADMIN',
        email_verified: true,
        status: 'ACTIVE' 
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