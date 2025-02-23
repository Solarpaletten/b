const Joi = require('joi');
const { logger } = require('../config/logger');

class ValidationManager {
  constructor() {
    // Базовые схемы валидации
    this.schemas = {
      // Пользователь
      user: {
        create: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(8).required(),
          name: Joi.string().min(2).max(50).required(),
          role: Joi.string().valid('admin', 'user', 'manager'),
        }),
        update: Joi.object({
          email: Joi.string().email(),
          password: Joi.string().min(8),
          name: Joi.string().min(2).max(50),
          role: Joi.string().valid('admin', 'user', 'manager'),
        }),
      },

      // Продукт
      product: {
        create: Joi.object({
          name: Joi.string().required(),
          description: Joi.string(),
          price: Joi.number().positive().required(),
          category: Joi.string().required(),
          stock: Joi.number().integer().min(0),
        }),
        update: Joi.object({
          name: Joi.string(),
          description: Joi.string(),
          price: Joi.number().positive(),
          category: Joi.string(),
          stock: Joi.number().integer().min(0),
        }),
      },

      // Заказ
      order: {
        create: Joi.object({
          userId: Joi.number().required(),
          products: Joi.array()
            .items(
              Joi.object({
                id: Joi.number().required(),
                quantity: Joi.number().integer().min(1).required(),
              })
            )
            .required(),
          shippingAddress: Joi.string().required(),
          paymentMethod: Joi.string().required(),
        }),
      },

      // Общие правила
      common: {
        id: Joi.number().positive().required(),
        pagination: Joi.object({
          page: Joi.number().integer().min(1),
          limit: Joi.number().integer().min(1).max(100),
        }),
        dateRange: Joi.object({
          startDate: Joi.date().iso(),
          endDate: Joi.date().iso().min(Joi.ref('startDate')),
        }),
      },
    };
  }

  // Валидация данных по схеме
  validate(data, schema) {
    try {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.debug('Validation failed:', { errors });
        return { isValid: false, errors, value: null };
      }

      return { isValid: true, errors: null, value };
    } catch (error) {
      logger.error('Validation error:', error);
      throw error;
    }
  }

  // Middleware для валидации запроса
  validateRequest(schemaName, type = 'create') {
    return (req, res, next) => {
      const schema = this.schemas[schemaName]?.[type];
      if (!schema) {
        logger.error('Validation schema not found:', { schemaName, type });
        return res.status(500).json({ error: 'Validation schema not found' });
      }

      const { isValid, errors, value } = this.validate(req.body, schema);
      if (!isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      req.validatedData = value;
      next();
    };
  }

  // Создание пользовательской схемы
  createSchema(definition) {
    try {
      return Joi.object(definition);
    } catch (error) {
      logger.error('Error creating schema:', error);
      throw error;
    }
  }

  // Добавление новой схемы
  addSchema(name, schema) {
    try {
      this.schemas[name] = schema;
      logger.info('New schema added:', { name });
    } catch (error) {
      logger.error('Error adding schema:', error);
      throw error;
    }
  }
}

module.exports = new ValidationManager();
