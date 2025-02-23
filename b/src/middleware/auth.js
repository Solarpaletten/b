const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

const auth = (req, res, next) => {
  try {
    // Извлекаем токен из заголовка Authorization
    const authHeader = req.header('Authorization');
    logger.info('Received Authorization header:', authHeader); // Логируем заголовок

    if (!authHeader) {
      logger.error('Authorization header is missing');
      return res
        .status(401)
        .json({ error: 'Access denied. No token provided.' });
    }

    // Проверяем, начинается ли заголовок с "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      logger.error('Invalid token format. Expected "Bearer <token>"');
      return res
        .status(401)
        .json({ error: 'Invalid token format. Expected "Bearer <token>".' });
    }

    // Извлекаем токен (убираем "Bearer ")
    const token = authHeader.replace('Bearer ', '');
    logger.info('Extracted token:', token); // Логируем извлеченный токен

    if (!token) {
      logger.error('Token is missing after extraction');
      return res
        .status(401)
        .json({ error: 'Access denied. No token provided.' });
    }

    // Проверяем токен
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Token verified successfully. User:', verified); // Логируем успешную проверку

    // Добавляем данные пользователя в запрос
    req.user = verified;
    next();
  } catch (error) {
    logger.error('Auth error:', error); // Логируем ошибку
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
