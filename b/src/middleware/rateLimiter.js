const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const prismaManager = require('../utils/prismaManager');
const { logger } = require('../config/logger');

// Базовый лимитер
const baseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит запросов
  message: { error: 'Too many requests, please try again later' },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
    });
    res
      .status(429)
      .json({ error: 'Too many requests, please try again later' });
  },
});

// Строгий лимитер для аутентификации
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // Лимит попыток
  message: { error: 'Too many login attempts, please try again later' },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      email: req.body.email,
    });
    res
      .status(429)
      .json({ error: 'Too many login attempts, please try again later' });
  },
});

module.exports = {
  baseLimiter,
  authLimiter,
};
