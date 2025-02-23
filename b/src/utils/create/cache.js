const NodeCache = require('node-cache');
const { logger } = require('../config/logger');

class CacheManager {
  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });

    // Слушаем события кэша
    this.cache.on('expired', (key, value) => {
      logger.debug('Cache expired:', { key });
    });

    this.cache.on('del', (key, value) => {
      logger.debug('Cache deleted:', { key });
    });

    this.cache.on('flush', () => {
      logger.debug('Cache flushed');
    });
  }

  // Получение данных из кэша с автоматической перезагрузкой
  async getOrSet(key, fetchFunction, ttl = 3600) {
    try {
      let value = this.cache.get(key);

      if (value === undefined) {
        logger.debug('Cache miss:', { key });
        value = await fetchFunction();
        this.cache.set(key, value, ttl);
      } else {
        logger.debug('Cache hit:', { key });
      }

      return value;
    } catch (error) {
      logger.error('Cache error:', { key, error: error.message });
      throw error;
    }
  }

  // Множественное получение
  async mget(keys) {
    return this.cache.mget(keys);
  }

  // Множественная установка
  async mset(keyValuePairs, ttl = 3600) {
    return this.cache.mset(
      keyValuePairs.map(([key, value]) => ({
        key,
        val: value,
        ttl,
      }))
    );
  }

  // Удаление по шаблону ключа
  deletePattern(pattern) {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let deleted = 0;

    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.del(key);
        deleted++;
      }
    });

    logger.debug('Cache pattern deletion:', { pattern, deletedCount: deleted });
    return deleted;
  }

  // Статистика кэша
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize,
    };
  }
}

module.exports = new CacheManager();
