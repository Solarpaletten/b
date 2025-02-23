const emailService = require('../services/emailService');

async function testAllTemplates() {
  const testEmail = 'solarleanid@gmail.com';

  console.log('Начинаем тестирование email отправки...');

  try {
    // Тест 1: Верификация email
    console.log('\nТест 1: Отправка верификации email...');
    await emailService.sendVerificationEmail(
      testEmail,
      '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c'
    );
    console.log('✓ Письмо верификации отправлено');

    // Тест 2: Временный пароль
    console.log('\nТест 2: Отправка временного пароля...');
    await emailService.sendTemporaryPassword(testEmail, 'pass123');
    console.log('✓ Письмо с паролем отправлено');

    // Тест 3: Создание компании
    console.log('\nТест 3: Уведомление о создании компании...');
    await emailService.sendCompanyCreatedEmail(testEmail, 'Тестовая Компания');
    console.log('✓ Письмо о создании компании отправлено');

    console.log('\nВсе тесты выполнены успешно!');
  } catch (error) {
    console.error('\nОшибка при тестировании:', error.message);
  }
}

testAllTemplates();
