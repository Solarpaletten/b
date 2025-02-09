const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('./config/logger');
const prismaManager = require('./utils/create/prismaManager');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
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

// API маршруты
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/stats/clients', clientsRoutes);
apiRouter.use('/stats', statsRoutes);
app.use('/api', apiRouter);

// Health-check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await prismaManager.prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'healthy', timestamp: new Date() });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Проверка состояния базы данных и запуск сервера
async function startServer() {
    try {
        await prismaManager.connect();
        logger.info('Database connected successfully');

        const port = process.env.PORT || 4000;
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
