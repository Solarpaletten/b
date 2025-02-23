const VERSION_HISTORY = {
  '1.0.0': {
    releaseDate: '2024-01-26',
    features: {
      core: [
        'Базовая версия API',
        'Система аутентификации и авторизации',
        'CRUD операции для основных сущностей',
        'Система логирования',
      ],
      technical: {
        backendSetup: [
          'Настройка Express.js сервера',
          'Подключение к PostgreSQL',
          'Middleware для обработки запросов',
          'Error handling система',
        ],
        authentication: [
          'JWT токены',
          'Защита роутов',
          'Управление сессиями',
          'Валидация данных',
        ],
        database: [
          'Основные модели данных',
          'Миграции',
          'Связи между таблицами',
          'Индексация',
        ],
        logging: [
          'Winston logger',
          'Логирование ошибок',
          'Логирование запросов',
          'Ротация логов',
        ],
      },
      documentation: [
        'API документация',
        'Схема базы данных',
        'Инструкция по развертыванию',
        'Описание конфигурации',
      ],
      devTools: [
        'ESLint настройка',
        'Prettier конфигурация',
        'Husky pre-commit hooks',
        'Jest тесты',
      ],
      security: [
        'Защита от XSS',
        'CORS настройка',
        'Rate limiting',
        'Валидация входных данных',
      ],
    },
  },
};

const CURRENT_VERSION = '1.4.0';

module.exports = {
  VERSION_HISTORY,
  CURRENT_VERSION,
};
