const { Transform, Writable, Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { logger } = require('../config/logger');

class StreamManager {
  constructor() {
    this.transforms = new Map();
    this.streams = new Map();
  }

  // Создание трансформирующего потока
  createTransform(options = {}) {
    try {
      return new Transform({
        objectMode: options.objectMode || true,
        transform(chunk, encoding, callback) {
          try {
            const transformed = options.transform
              ? options.transform(chunk)
              : chunk;
            callback(null, transformed);
          } catch (error) {
            callback(error);
          }
        },
      });
    } catch (error) {
      logger.error('Error creating transform stream:', error);
      throw error;
    }
  }

  // Создание потока для фильтрации
  createFilter(predicate) {
    try {
      return this.createTransform({
        transform: (chunk) => (predicate(chunk) ? chunk : null),
      });
    } catch (error) {
      logger.error('Error creating filter stream:', error);
      throw error;
    }
  }

  // Создание потока для агрегации
  createAggregator(options = {}) {
    try {
      let buffer = [];
      return new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          buffer.push(chunk);

          if (buffer.length >= (options.batchSize || 100)) {
            const result = options.aggregate(buffer);
            buffer = [];
            callback(null, result);
          } else {
            callback();
          }
        },
        flush(callback) {
          if (buffer.length > 0) {
            const result = options.aggregate(buffer);
            callback(null, result);
          } else {
            callback();
          }
        },
      });
    } catch (error) {
      logger.error('Error creating aggregator stream:', error);
      throw error;
    }
  }

  // Создание потока для записи в файл
  createFileWriter(filePath, options = {}) {
    try {
      const fs = require('fs');
      return fs.createWriteStream(filePath, options);
    } catch (error) {
      logger.error('Error creating file writer stream:', error);
      throw error;
    }
  }

  // Создание потока для чтения из файла
  createFileReader(filePath, options = {}) {
    try {
      const fs = require('fs');
      return fs.createReadStream(filePath, options);
    } catch (error) {
      logger.error('Error creating file reader stream:', error);
      throw error;
    }
  }

  // Обработка потока данных
  async processStream(readStream, transforms, writeStream) {
    try {
      const streams = [readStream, ...transforms, writeStream];
      await pipeline(streams);
      logger.info('Stream processing completed');
    } catch (error) {
      logger.error('Error processing stream:', error);
      throw error;
    }
  }

  // Создание потока для разбора JSON
  createJsonParser() {
    try {
      return this.createTransform({
        transform: (chunk) => {
          if (typeof chunk === 'string') {
            return JSON.parse(chunk);
          }
          return chunk;
        },
      });
    } catch (error) {
      logger.error('Error creating JSON parser stream:', error);
      throw error;
    }
  }

  // Создание потока для сериализации в JSON
  createJsonStringifier() {
    try {
      return this.createTransform({
        transform: (chunk) => JSON.stringify(chunk),
      });
    } catch (error) {
      logger.error('Error creating JSON stringifier stream:', error);
      throw error;
    }
  }

  // Создание потока для дедупликации
  createDeduplicator(keySelector = (item) => item) {
    try {
      const seen = new Set();
      return this.createTransform({
        transform: (chunk) => {
          const key = keySelector(chunk);
          if (!seen.has(key)) {
            seen.add(key);
            return chunk;
          }
          return null;
        },
      });
    } catch (error) {
      logger.error('Error creating deduplicator stream:', error);
      throw error;
    }
  }

  // Создание потока для rate limiting
  createRateLimiter(options = {}) {
    try {
      const interval = options.interval || 1000;
      const maxRequests = options.maxRequests || 10;
      let tokens = maxRequests;
      let lastRefill = Date.now();

      return this.createTransform({
        transform: (chunk, encoding, callback) => {
          const now = Date.now();
          const timePassed = now - lastRefill;
          const refills = Math.floor(timePassed / interval);

          if (refills > 0) {
            tokens = Math.min(maxRequests, tokens + refills * maxRequests);
            lastRefill = now;
          }

          if (tokens > 0) {
            tokens--;
            callback(null, chunk);
          } else {
            const delay = interval - (now - lastRefill);
            setTimeout(() => {
              tokens = maxRequests - 1;
              lastRefill = Date.now();
              callback(null, chunk);
            }, delay);
          }
        },
      });
    } catch (error) {
      logger.error('Error creating rate limiter stream:', error);
      throw error;
    }
  }
}

module.exports = new StreamManager();
