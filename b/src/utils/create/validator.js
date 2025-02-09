const Joi = require('joi');
const { logger } = require('../config/logger');

// Базовые схемы валидации
const schemas = {
  id: Joi.number().integer().positive(),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(100),
  phone: Joi.string().pattern(/^\+?[\d\s-()]{8,20}$/),
  date: Joi.date().iso(),
  currency: Joi.string().valid('EUR', 'USD'),
  price: Joi.number().precision(2).positive(),
  
  // Пользователь
  user: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('admin', 'user', 'manager')
  }),

  // Клиент
  client: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]{8,20}$/),
    type: Joi.string().valid('INDIVIDUAL', 'COMPANY').required(),
    clientType: Joi.string().valid('BOTH', 'CUSTOMER', 'SUPPLIER').required(),
    code: Joi.string().max(50),
    vat_code: Joi.string().max(50)
  }),

  // Продукт
  product: Joi.object({
    code: Joi.string().max(50).required(),
    name: Joi.string().max(255).required(),
    description: Joi.string(),
    unit: Joi.string().max(20).required(),
    price: Joi.number().precision(2).positive().required(),
    currency: Joi.string().valid('EUR', 'USD').required()
  }),

  // Продажа/Покупка
  transaction: Joi.object({
    doc_number: Joi.string().max(50).required(),
    doc_date: Joi.date().iso().required(),
    client_id: Joi.number().integer().positive().required(),
    warehouse_id: Joi.number().integer().positive().required(),
    total_amount: Joi.number().precision(2).positive().required(),
    currency: Joi.string().valid('EUR', 'USD').required(),
    status: Joi.string().max(20),
    invoice_type: Joi.string().max(50),
    invoice_number: Joi.string().max(50).required(),
    vat_rate: Joi.number().precision(2).min(0).max(100)
  })
};

// Функция валидации
const validate = (schema, data) => {
  try {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.debug('Validation failed:', { errors });
      return { isValid: false, errors, value: null };
    }

    return { isValid: true, errors: null, value };
  } catch (error) {
    logger.error('Validation error:', error);
    throw error;
  }
};

// Middleware для валидации
const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { isValid, errors, value } = validate(schema, req.body);

    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateMiddleware
}; 