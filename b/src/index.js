const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('./config/logger');
const prismaManager = require('./utils/create/prismaManager');

// Импорт всех маршрутов из единой директории
const authRoutes = require('./routes/authRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Проверка обязательных переменных окружения
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SMTP_USER', 'SMTP_PASS'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Функция проверки состояния базы данных
async function checkDatabaseState() {
    try {
        await prismaManager.connect();
        logger.info('Database connected successfully');

        // Правильные имена таблиц из вашей схемы Prisma
        const tables = [
            { name: 'users', model: 'users' },
            { name: 'clients', model: 'clients' },
            { name: 'products', model: 'products' },
            { name: 'bank_operations', model: 'bank_operations' },
            { name: 'warehouses', model: 'warehouses' },
            { name: 'sales', model: 'sales' },
            { name: 'chart_of_accounts', model: 'chart_of_accounts' },
            { name: 'doc_settlement', model: 'doc_settlement' }
        ];

        // Проверяем каждую таблицу
        for (const table of tables) {
            try {
                const count = await prismaManager.prisma[table.model].count();
                logger.info(`${table.name}: ${count} records`);
            } catch (error) {
                logger.warn(`Could not count records in ${table.name}: ${error.message}`);
            }
        }

        // Проверяем наличие пользователей
        const usersCount = await prismaManager.prisma.users.count();

        // Создаем тестового админа только если нет пользователей и мы в development
        if (process.env.NODE_ENV === 'development' && usersCount === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('pas123', 10);
            
            await prismaManager.prisma.users.create({
                data: {
                    email: 'solar@solar.pl',
                    username: 'solar',
                    password_hash: hashedPassword,
                    role: 'admin',
                    status: 'active',
                    email_verified: true,
                    is_verified: true
                }
            });
            logger.info('Created default admin user');
        }

    } catch (error) {
        logger.error('Database check failed:', error);
        // В production можно продолжить работу
        if (process.env.NODE_ENV === 'development') {
            process.exit(1);
        }
    }
}

// Настройка CORS с улучшенной 
const corsOptions = {
    origin: process.env.CORS_ORIGIN 
        ? [process.env.CORS_ORIGIN, 'http://localhost:5173']
        : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 часа для кеширования preflight запросов
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Улучшенное логирование запросов
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString()
        });
    });
    next();
});

// Группировка всех API маршрутов
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientsRoutes);
apiRouter.use('/stats', statsRoutes);

// Подключение API маршрутов с общим префиксом
app.use('/api', apiRouter);

// Единый endpoint для проверки статуса
app.get('/api/health', async (req, res) => {
    try {
        await prismaManager.prisma.$queryRaw`SELECT 1`;
        
        const dbInfo = {
            users: await prismaManager.prisma.users.count(),
            clients: await prismaManager.prisma.clients.count(),
        };

        const tables = Object.entries(dbInfo).map(([name, count]) => ({
            name,
            rowCount: count
        }));

        res.json({
            status: 'healthy',
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: 'connected',
                tables,
                name: process.env.DATABASE_URL.split('/').pop(),
                version: require('@prisma/client/package.json').version
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodejs: process.version
            }
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date(),
            error: error.message
        });
    }
});

// Улучшенная обработка ошибок с разными типами
app.use((err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Определяем тип ошибки и соответствующий статус
    let status = 500;
    let message = 'Internal Server Error';

    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
        status = 403;
        message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
        status = 404;
        message = 'Not Found';
    }

    res.status(status).json({
        error: {
            message,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        }
    });
});

// Запуск сервера
const port = process.env.PORT || 4000;
app.listen(port, async () => {
    logger.info(`Server starting on port ${port}...`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS enabled for: ${corsOptions.origin}`);
    await checkDatabaseState();
    logger.info('Server is ready to accept connections');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await prismaManager.disconnect();
    process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            logger.error(`Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }
}

module.exports = app;