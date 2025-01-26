const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getToken() {
  try {
    // Находим пользователя
    const user = await prisma.users.findUnique({
      where: {
        email: 'solar@solar.pl'
      }
    });

    if (!user) {
      console.error('Пользователь не найден');
      return;
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\nТокен успешно создан:');
    console.log('JWT_TOKEN=' + token);
    console.log('\nДобавьте эту строку в ваш .env файл');

  } catch (error) {
    console.error('Ошибка при получении токена:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getToken(); 