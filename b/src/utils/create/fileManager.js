const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const multer = require('multer');

class FileManager {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(process.cwd(), 'temp');
    this.initDirectories();
  }

  async initDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      logger.info('File directories initialized');
    } catch (error) {
      logger.error('Error initializing directories:', error);
      throw error;
    }
  }

  // Конфигурация multer для загрузки файлов
  getUploadMiddleware(options = {}) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(
          null,
          `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`
        );
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = options.allowedTypes || [
        'image/jpeg',
        'image/png',
        'application/pdf',
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: options.maxSize || 5 * 1024 * 1024, // 5MB по умолчанию
      },
    });
  }

  // Сохранение файла с проверкой
  async saveFile(file, customPath = '') {
    try {
      const targetDir = path.join(this.uploadDir, customPath);
      await fs.mkdir(targetDir, { recursive: true });

      const fileName = `${Date.now()}-${crypto
        .randomBytes(16)
        .toString('hex')}${path.extname(file.originalname)}`;
      const filePath = path.join(targetDir, fileName);

      await fs.writeFile(filePath, file.buffer);
      logger.info('File saved successfully:', { path: filePath });

      return {
        fileName,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      logger.error('Error saving file:', error);
      throw error;
    }
  }

  // Удаление файла
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info('File deleted successfully:', { path: filePath });
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  // Очистка временных файлов
  async cleanupTemp(maxAge = 24 * 60 * 60 * 1000) {
    // 24 часа по умолчанию
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          logger.debug('Deleted temp file:', { path: filePath });
        }
      }
    } catch (error) {
      logger.error('Error cleaning temp files:', error);
      throw error;
    }
  }
}

module.exports = new FileManager();
