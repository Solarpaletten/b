const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../config/logger');
const { promisify } = require('util');
const execAsync = promisify(exec);
const archiver = require('archiver');
const dateManager = require('./dateManager');

class BackupManager {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing backup directory:', error);
      throw error;
    }
  }

  // Создание бэкапа базы данных
  async createDatabaseBackup() {
    try {
      const timestamp = dateManager.format(new Date(), 'YYYY-MM-DD-HHmmss');
      const fileName = `db-backup-${timestamp}.sql`;
      const filePath = path.join(this.backupDir, fileName);

      // Извлекаем параметры подключения из DATABASE_URL
      const dbUrl = new URL(process.env.DATABASE_URL);
      const dbName = dbUrl.pathname.slice(1);
      const dbUser = dbUrl.username;
      const dbPass = dbUrl.password;
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port;

      // Создаем команду для pg_dump
      const command = `PGPASSWORD=${dbPass} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p > ${filePath}`;
      
      await execAsync(command);
      logger.info('Database backup created successfully:', { path: filePath });

      // Архивируем бэкап
      await this.compressFile(filePath);
      await fs.unlink(filePath); // Удаляем оригинальный файл

      return `${filePath}.gz`;
    } catch (error) {
      logger.error('Error creating database backup:', error);
      throw error;
    }
  }

  // Архивация файла
  async compressFile(filePath) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(`${filePath}.zip`);

      output.on('close', () => {
        logger.info('File compressed successfully:', {
          path: `${filePath}.zip`,
          size: archive.pointer()
        });
        resolve(`${filePath}.zip`);
      });

      archive.on('error', (err) => {
        logger.error('Compression error:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.file(filePath, { name: path.basename(filePath) });
      archive.finalize();
    });
  }

  // Восстановление базы данных из бэкапа
  async restoreDatabase(backupPath) {
    try {
      // Извлекаем параметры подключения
      const dbUrl = new URL(process.env.DATABASE_URL);
      const dbName = dbUrl.pathname.slice(1);
      const dbUser = dbUrl.username;
      const dbPass = dbUrl.password;
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port;

      // Разархивируем файл если нужно
      let restorePath = backupPath;
      if (backupPath.endsWith('.zip')) {
        restorePath = await this.decompressFile(backupPath);
      }

      const command = `PGPASSWORD=${dbPass} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} < ${restorePath}`;
      await execAsync(command);

      logger.info('Database restored successfully from:', { path: backupPath });
      return true;
    } catch (error) {
      logger.error('Error restoring database:', error);
      throw error;
    }
  }

  // Очистка старых бэкапов
  async cleanupOldBackups(maxAge = 7) { // maxAge в днях
    try {
      const files = await fs.readdir(this.backupDir);
      const now = new Date();

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        const fileAge = dateManager.getDiff(now, stats.mtime, 'day');

        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          logger.info('Deleted old backup:', { path: filePath });
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old backups:', error);
      throw error;
    }
  }
}

module.exports = new BackupManager(); 