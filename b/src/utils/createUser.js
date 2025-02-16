const { PrismaClient } = require('@prisma/client');
const prismaManager = require('./create/prismaManager');

async function createUser() {
  try {
    const newUser = await prismaManager.prisma.users.create({
      data: {
        email: 'solar@solar.pl',
        password_hash: '$2a$10$gxupJdmymT3mtymEjNZpPefwn1iymemwU4c9OrHaP8Bm/mTFCIeqi',
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