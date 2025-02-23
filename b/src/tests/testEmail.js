const emailService = require('../services/emailService');

async function runTest() {
  console.log('Начинаем тестирование email системы...');

  // Проверяем соединение
  const isConnected = await emailService.testConnection();
  if (!isConnected) {
    console.error('Ошибка подключения к SMTP серверу');
    return;
  }

  // Отправляем тестовое письмо
  const isSent = await emailService.sendTestEmail();
  if (isSent) {
    console.log('Тестирование завершено успешно');
  } else {
    console.error('Тестирование завершилось с ошибкой');
  }
}

runTest();
