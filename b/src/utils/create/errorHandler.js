const { logger } = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  constructor() {
    this.errorTypes = {
      VALIDATION_ERROR: {
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      },
      AUTHENTICATION_ERROR: {
        statusCode: 401,
        code: 'AUTHENTICATION_ERROR'
      },
      AUTHORIZATION_ERROR: {
        statusCode: 403,
        code: 'AUTHORIZATION_ERROR'
      },
      NOT_FOUND: {
        statusCode: 404,
        code: 'NOT_FOUND'
      },
      CONFLICT: {
        statusCode: 409,
        code: 'CONFLICT'
      },
      RATE_LIMIT_ERROR: {
        statusCode: 429,
        code: 'RATE_LIMIT_ERROR'
      }
    };
  }

  // Создание ошибки по типу
  createError(type, message, details = null) {
    const errorConfig = this.errorTypes[type];
    if (!errorConfig) {
      throw new Error(`Unknown error type: ${type}`);
    }

    const error = new AppError(message, errorConfig.statusCode, errorConfig.code);
    if (details) {
      error.details = details;
    }
    return error;
  }

  // Middleware для обработки ошибок
  handleError(err, req, res, next) {
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode
    });

    // Если это операционная ошибка (ожидаемая)
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        code: err.code,
        message: err.message,
        details: err.details || null
      });
    }

    // Если это неожиданная ошибка
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: err.message,
        stack: err.stack
      });
    }

    // Для production
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    });
  }

  // Асинхронный обработчик ошибок
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = {
  AppError,
  ErrorHandler: new ErrorHandler()
}; 