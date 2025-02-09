const { PrismaClient } = require('@prisma/client');
const { logger } = require('../../config/logger');

class PrismaManager {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' }
      ],
    });

    // Логирование запросов
    this.prisma.$on('query', (e) => {
      logger.debug('Query:', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`
      });
    });

    // Логирование ошибок
    this.prisma.$on('error', (e) => {
      logger.error('Prisma Error:', e);
    });

    // Логирование информации
    this.prisma.$on('info', (e) => {
      logger.info('Prisma Info:', e);
    });

    // Логирование предупреждений
    this.prisma.$on('warn', (e) => {
      logger.warn('Prisma Warning:', e);
    });
  }

  // Подключение к БД
  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  // Отключение от БД
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection error:', error);
      throw error;
    }
  }

  // Метод для пагинации
  async paginate(model, options) {
    const { page = 1, perPage = 10, where = {}, orderBy = {}, include = {} } = options;
    const skip = (page - 1) * perPage;

    try {
      const [data, total] = await Promise.all([
        this.prisma[model].findMany({
          skip,
          take: perPage,
          where,
          orderBy,
          include
        }),
        this.prisma[model].count({ where })
      ]);

      return {
        data,
        meta: {
          total,
          page,
          perPage,
          pageCount: Math.ceil(total / perPage)
        }
      };
    } catch (error) {
      logger.error(`Pagination error for ${model}:`, error);
      throw error;
    }
  }

  // Метод для транзакций
  async transaction(operations) {
    try {
      return await this.prisma.$transaction(operations);
    } catch (error) {
      logger.error('Transaction error:', error);
      throw error;
    }
  }

  // Безопасное выполнение запроса с повторными попытками
  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (!this.isRetryableError(error)) {
          throw error;
        }
        logger.warn('Retrying database operation:', {
          attempt,
          maxRetries,
          error: error.message
        });
        await this.delay(Math.min(100 * Math.pow(2, attempt), 1000));
      }
    }
    throw lastError;
  }

  // Проверка, можно ли повторить операцию
  isRetryableError(error) {
    return error.code === 'P1000' || // Authentication failed
           error.code === 'P1001' || // Can't reach database server
           error.code === 'P1002' || // Connection timed out
           error.code === 'P1008' || // Operations timed out
           error.code === 'P1017';   // Server closed the connection
  }

  // Мягкое удаление
  async softDelete(model, id) {
    try {
      return await this.prisma[model].update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isDeleted: true
        }
      });
    } catch (error) {
      logger.error('Soft delete error:', error);
      throw error;
    }
  }

  // Восстановление записи
  async restore(model, id) {
    try {
      return await this.prisma[model].update({
        where: { id },
        data: {
          deletedAt: null,
          isDeleted: false
        }
      });
    } catch (error) {
      logger.error('Restore error:', error);
      throw error;
    }
  }

  // Массовое создание или обновление
  async upsertMany(model, data, uniqueKey) {
    try {
      return await this.transaction(
        data.map(item => 
          this.prisma[model].upsert({
            where: { [uniqueKey]: item[uniqueKey] },
            create: item,
            update: item
          })
        )
      );
    } catch (error) {
      logger.error('Upsert many error:', error);
      throw error;
    }
  }

  // Задержка для повторных попыток
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Создаем единственный экземпляр
const prismaManager = new PrismaManager();

module.exports = prismaManager; 