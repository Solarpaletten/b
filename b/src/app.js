const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('./config/logger');
const prismaManager = require('./utils/create/prismaManager');

const app = express();

// Middleware
app.use(compression());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Импорт маршрутов
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/clients', require('./routes/clientsRoutes'));
apiRouter.use('/stats', require('./routes/statsRoutes'));

apiRouter.get('/test', (req, res) => {
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

// Health-check endpoint с информацией о таблицах
app.get('/api/health', async (req, res) => {
  try {
    // Проверяем соединение с БД через prismaManager
    await prismaManager.prisma.$queryRaw`SELECT 1`;

    // Получаем список таблиц
    const tables = await prismaManager.prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      tables: tables.map((t) => t.table_name),
      database_url: process.env.DATABASE_URL?.split('@')[1], // Показываем только хост
      connection: 'Connected via PrismaManager',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date(),
      connection: 'Failed via PrismaManager',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
