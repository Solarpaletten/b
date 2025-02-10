const app = require('./app');  // Импортируем наше приложение
const { logger } = require('./config/logger');
const prismaManager = require('./utils/create/prismaManager');

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