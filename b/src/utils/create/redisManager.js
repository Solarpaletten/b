const Redis = require('ioredis');
const { logger } = require('../config/logger');

class RedisManager {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    this.subscriber = new Redis(process.env.REDIS_URL);

    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  // Базовые операции с кэшем
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      logger.debug('Redis set:', { key, ttl });
    } catch (error) {
      logger.error('Redis set error:', { key, error: error.message });
      throw error;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', { key, error: error.message });
      throw error;
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      logger.debug('Redis delete:', { key });
    } catch (error) {
      logger.error('Redis delete error:', { key, error: error.message });
      throw error;
    }
  }

  // Работа с хэшами
  async hset(hash, field, value) {
    try {
      await this.client.hset(hash, field, JSON.stringify(value));
      logger.debug('Redis hset:', { hash, field });
    } catch (error) {
      logger.error('Redis hset error:', { hash, field, error: error.message });
      throw error;
    }
  }

  async hget(hash, field) {
    try {
      const value = await this.client.hget(hash, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis hget error:', { hash, field, error: error.message });
      throw error;
    }
  }

  // Pub/Sub операции
  async publish(channel, message) {
    try {
      await this.client.publish(channel, JSON.stringify(message));
      logger.debug('Redis publish:', { channel });
    } catch (error) {
      logger.error('Redis publish error:', { channel, error: error.message });
      throw error;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          callback(JSON.parse(message));
        }
      });
      logger.debug('Redis subscribed:', { channel });
    } catch (error) {
      logger.error('Redis subscribe error:', { channel, error: error.message });
      throw error;
    }
  }

  // Работа со списками
  async lpush(key, value) {
    try {
      await this.client.lpush(key, JSON.stringify(value));
      logger.debug('Redis lpush:', { key });
    } catch (error) {
      logger.error('Redis lpush error:', { key, error: error.message });
      throw error;
    }
  }

  async rpop(key) {
    try {
      const value = await this.client.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis rpop error:', { key, error: error.message });
      throw error;
    }
  }

  // Очистка по шаблону
  async deletePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        logger.debug('Redis pattern deletion:', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Redis pattern deletion error:', { pattern, error: error.message });
      throw error;
    }
  }

  // Получение статистики
  async getStats() {
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      logger.error('Redis stats error:', error);
      throw error;
    }
  }
}

module.exports = new RedisManager(); 