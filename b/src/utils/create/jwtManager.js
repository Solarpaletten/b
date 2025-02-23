const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');
const redisManager = require('./redisManager');

class JWTManager {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  // Генерация access token
  generateAccessToken(payload) {
    try {
      return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
      });
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw error;
    }
  }

  // Генерация refresh token
  generateRefreshToken(payload) {
    try {
      const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
      });

      // Сохраняем refresh token в Redis
      const key = `refresh_token:${payload.userId}`;
      redisManager.set(key, refreshToken, 7 * 24 * 60 * 60); // 7 days

      return refreshToken;
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw error;
    }
  }

  // Верификация access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.debug('Access token expired');
      } else {
        logger.error('Error verifying access token:', error);
      }
      throw error;
    }
  }

  // Верификация refresh token
  async verifyRefreshToken(token, userId) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret);
      const storedToken = await redisManager.get(`refresh_token:${userId}`);

      if (token !== storedToken) {
        throw new Error('Invalid refresh token');
      }

      return decoded;
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw error;
    }
  }

  // Отзыв refresh token
  async revokeRefreshToken(userId) {
    try {
      await redisManager.delete(`refresh_token:${userId}`);
      logger.info('Refresh token revoked:', { userId });
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  // Обновление токенов
  async refreshTokens(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
      const storedToken = await redisManager.get(
        `refresh_token:${decoded.userId}`
      );

      if (refreshToken !== storedToken) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken({
        userId: decoded.userId,
        role: decoded.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: decoded.userId,
        role: decoded.role,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  // Middleware для проверки JWT
  authenticate() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new Error('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = this.verifyAccessToken(token);

        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({
          error: 'Authentication failed',
          message: error.message,
        });
      }
    };
  }

  // Middleware для проверки ролей
  authorize(roles = []) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new Error('User not authenticated');
        }

        if (roles.length && !roles.includes(req.user.role)) {
          throw new Error('Insufficient permissions');
        }

        next();
      } catch (error) {
        res.status(403).json({
          error: 'Authorization failed',
          message: error.message,
        });
      }
    };
  }
}

module.exports = new JWTManager();
