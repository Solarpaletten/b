const Bull = require('bull');
const { logger } = require('../config/logger');
const emailManager = require('./emailManager');
const reportGenerator = require('./reportGenerator');
const backupManager = require('./backupManager');

class QueueManager {
  constructor() {
    // Инициализация очередей
    this.emailQueue = new Bull('email-queue', process.env.REDIS_URL);
    this.reportQueue = new Bull('report-queue', process.env.REDIS_URL);
    this.backupQueue = new Bull('backup-queue', process.env.REDIS_URL);

    this.initializeQueues();
  }

  async initializeQueues() {
    // Обработчик email очереди
    this.emailQueue.process(async (job) => {
      const { type, data } = job.data;
      logger.info('Processing email job:', { type, id: job.id });

      try {
        switch (type) {
          case 'template':
            await emailManager.sendTemplateEmail(
              data.to,
              data.templateName,
              data.templateData
            );
            break;
          case 'simple':
            await emailManager.sendSimpleEmail(
              data.to,
              data.subject,
              data.text,
              data.html
            );
            break;
          default:
            throw new Error(`Unknown email type: ${type}`);
        }
      } catch (error) {
        logger.error('Email job failed:', error);
        throw error;
      }
    });

    // Обработчик очереди отчетов
    this.reportQueue.process(async (job) => {
      const { type, data } = job.data;
      logger.info('Processing report job:', { type, id: job.id });

      try {
        let reportPath;
        switch (type) {
          case 'excel':
            reportPath = await reportGenerator.generateExcel(data.data, data.options);
            break;
          case 'pdf':
            reportPath = await reportGenerator.generatePDF(data.data, data.options);
            break;
          default:
            throw new Error(`Unknown report type: ${type}`);
        }

        // Отправка отчета по email, если указан
        if (data.email) {
          await this.addEmailJob({
            type: 'simple',
            data: {
              to: data.email,
              subject: 'Your Report is Ready',
              text: 'Please find your report attached.',
              attachments: [{
                filename: reportPath.split('/').pop(),
                path: reportPath
              }]
            }
          });
        }

        return reportPath;
      } catch (error) {
        logger.error('Report job failed:', error);
        throw error;
      }
    });

    // Обработчик очереди бэкапов
    this.backupQueue.process(async (job) => {
      logger.info('Processing backup job:', { id: job.id });

      try {
        const backupPath = await backupManager.createDatabaseBackup();
        
        // Отправка уведомления об успешном бэкапе
        if (process.env.ADMIN_EMAIL) {
          await this.addEmailJob({
            type: 'simple',
            data: {
              to: process.env.ADMIN_EMAIL,
              subject: 'Database Backup Completed',
              text: `Backup created successfully: ${backupPath}`
            }
          });
        }

        return backupPath;
      } catch (error) {
        logger.error('Backup job failed:', error);
        throw error;
      }
    });

    // Обработка событий для всех очередей
    [this.emailQueue, this.reportQueue, this.backupQueue].forEach(queue => {
      queue.on('completed', (job) => {
        logger.info(`Job completed:`, { 
          queue: queue.name, 
          id: job.id 
        });
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job failed:`, { 
          queue: queue.name, 
          id: job.id, 
          error: err.message 
        });
      });
    });
  }

  // Добавление задачи в очередь email
  async addEmailJob(data, options = {}) {
    return this.emailQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      ...options
    });
  }

  // Добавление задачи в очередь отчетов
  async addReportJob(data, options = {}) {
    return this.reportQueue.add(data, {
      attempts: 2,
      ...options
    });
  }

  // Добавление задачи в очередь бэкапов
  async addBackupJob(options = {}) {
    return this.backupQueue.add({}, {
      attempts: 3,
      ...options
    });
  }

  // Получение статистики очередей
  async getQueuesStats() {
    const queues = [this.emailQueue, this.reportQueue, this.backupQueue];
    const stats = await Promise.all(
      queues.map(async (queue) => ({
        name: queue.name,
        counts: await queue.getJobCounts()
      }))
    );

    return stats;
  }

  // Очистка завершенных задач
  async cleanCompletedJobs() {
    const queues = [this.emailQueue, this.reportQueue, this.backupQueue];
    await Promise.all(
      queues.map(queue => queue.clean(24 * 3600 * 1000, 'completed'))
    );
  }
}

module.exports = new QueueManager(); 