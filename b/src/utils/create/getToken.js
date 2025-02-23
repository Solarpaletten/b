const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Добавляем загрузку .env файла

const prisma = new PrismaClient();

async function getToken() {
  try {
    // Проверяем наличие JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ Ошибка: JWT_SECRET не найден в .env файле');
      console.log('\n💡 Добавьте в .env файл строку:');
      console.log('JWT_SECRET=your-secret-key-here');
      return;
    }

    // Находим пользователя
    const user = await prisma.users.findUnique({
      where: {
        email: 'solar@solar.pl',
      },
    });

    if (!user) {
      console.error('❌ Пользователь solar@solar.pl не найден в базе данных');
      return;
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n✅ Токен успешно создан!\n');
    console.log('JWT_TOKEN=' + token);
    console.log('\n💡 Скопируйте эту строку в ваш .env файл');
  } catch (error) {
    if (error.name === 'PrismaClientInitializationError') {
      console.error(
        '❌ Ошибка подключения к базе данных. Проверьте DATABASE_URL в .env файле'
      );
    } else {
      console.error('❌ Ошибка при получении токена:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

getToken();
