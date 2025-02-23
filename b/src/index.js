// b/index.js
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const { logger } = require('./config/logger');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(require('morgan')(process.env.LOG_LEVEL || 'dev'));

// Роуты
app.use('/api/clients', clientRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      logger.info(
        `Server running on port ${port} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
