const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Создаем директорию для логов, если её нет
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Форматирование логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Настройка уровней логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Определение уровня логирования на основе окружения
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Создание логгера
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Функция для логирования HTTP запросов
const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
  });
  next();
};

// Функция для логирования ошибок базы данных
const dbLogger = {
  query: (query) => {
    logger.debug('Database Query:', {
      query: query.query,
      params: query.params,
      duration: query.duration,
    });
  },
  error: (error) => {
    logger.error('Database Error:', {
      message: error.message,
      stack: error.stack,
    });
  },
};

// Утилиты для логирования
const logUtils = {
  // Логирование производительности
  measurePerformance: async (name, fn) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      logger.info(`Performance: ${name}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Performance Error: ${name}`, {
        duration: `${duration}ms`,
        error: error.message,
      });
      throw error;
    }
  },

  // Логирование бизнес-событий
  logBusinessEvent: (event, data) => {
    logger.info('Business Event', { event, data });
  },

  // Логирование безопасности
  logSecurity: (event, data) => {
    logger.warn('Security Event', { event, data });
  },
};

module.exports = {
  logger,
  httpLogger,
  dbLogger,
  logUtils,
};
