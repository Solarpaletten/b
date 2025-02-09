module.exports = {
  testEnvironment: 'node',               // Среда выполнения тестов (Node.js)
  setupFilesAfterEnv: ['./tests/setup.js'], // Указать путь до setup-файла
  testMatch: ['**/tests/**/*.test.js'],   // Паттерн поиска тестов
};
