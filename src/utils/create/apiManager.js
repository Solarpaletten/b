const axios = require('axios');
const { logger } = require('../config/logger');
const redisManager = require('./redisManager');

class APIManager {
  constructor() {
    // Создаем экземпляр axios с базовой конфигурацией
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Добавляем перехватчики
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Перехватчик запросов
    this.client.interceptors.request.use(
      (config) => {
        const requestId = Math.random().toString(36).substring(7);
        config.requestId = requestId;

        logger.debug('API Request:', {
          requestId,
          method: config.method,
          url: config.url
        });

        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Перехватчик ответов
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response:', {
          requestId: response.config.requestId,
          status: response.status
        });
        return response;
      },
      (error) => {
        logger.error('API Response Error:', {
          requestId: error.config?.requestId,
          error: error.message,
          status: error.response?.status
        });
        return Promise.reject(error);
      }
    );
  }

  // Базовые HTTP методы с кэшированием
  async get(url, config = {}) {
    const cacheKey = `api:${url}`;
    const cacheTTL = config.cacheTTL || 300; // 5 минут по умолчанию

    try {
      // Проверяем кэш
      if (!config.skipCache) {
        const cached = await redisManager.get(cacheKey);
        if (cached) {
          logger.debug('API Cache Hit:', { url });
          return cached;
        }
      }

      const response = await this.client.get(url, config);
      
      // Кэшируем ответ
      if (!config.skipCache) {
        await redisManager.set(cacheKey, response.data, cacheTTL);
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Обработка ошибок
  handleError(error) {
    const apiError = new Error();
    
    if (error.response) {
      // Ответ сервера с ошибкой
      apiError.status = error.response.status;
      apiError.data = error.response.data;
      apiError.message = error.response.data.message || 'API Error';
    } else if (error.request) {
      // Нет ответа от сервера
      apiError.status = 503;
      apiError.message = 'Service Unavailable';
    } else {
      // Ошибка настройки запроса
      apiError.status = 500;
      apiError.message = error.message;
    }

    return apiError;
  }

  // Пакетные запросы
  async batch(requests) {
    try {
      const responses = await Promise.all(
        requests.map(request => {
          const method = request.method.toLowerCase();
          return this[method](request.url, request.data, request.config);
        })
      );
      return responses;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Повторные попытки запроса
  async retry(fn, retries = 3, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(fn, retries - 1, delay * 2);
    }
  }
}

module.exports = new APIManager(); 