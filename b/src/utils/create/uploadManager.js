const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp');
const { logger } = require('../config/logger');

class UploadManager {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(process.cwd(), 'temp');
    this.maxFileSize = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB default
    
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      logger.info('Upload directories initialized');
    } catch (error) {
      logger.error('Error initializing upload directories:', error);
      throw error;
    }
  }

  // Конфигурация multer
  getUploadMiddleware(options = {}) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.tempDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = options.allowedTypes || 
        [...this.allowedImageTypes, ...this.allowedDocTypes];

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
        fileSize: options.maxSize || this.maxFileSize
      }
    });
  }

  // Обработка изображений
  async processImage(file, options = {}) {
    try {
      const image = sharp(file.path);
      
      if (options.resize) {
        image.resize(options.resize.width, options.resize.height, {
          fit: options.resize.fit || 'cover',
          position: options.resize.position || 'center'
        });
      }

      if (options.format) {
        image.toFormat(options.format, {
          quality: options.quality || 80,
          progressive: true
        });
      }

      const outputPath = path.join(
        this.uploadDir,
        `${path.parse(file.filename).name}.${options.format || 'jpg'}`
      );

      await image.toFile(outputPath);
      await fs.unlink(file.path); // Удаляем временный файл

      return {
        path: outputPath,
        filename: path.basename(outputPath)
      };
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  // Перемещение файла из временной директории
  async moveFile(file, customPath = '') {
    try {
      const targetDir = path.join(this.uploadDir, customPath);
      await fs.mkdir(targetDir, { recursive: true });

      const targetPath = path.join(targetDir, file.filename);
      await fs.rename(file.path, targetPath);

      return {
        path: targetPath,
        filename: file.filename
      };
    } catch (error) {
      logger.error('Error moving file:', error);
      throw error;
    }
  }

  // Удаление файла
  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
      logger.info('File deleted successfully:', { filename });
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  // Очистка временных файлов
  async cleanupTemp(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
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

module.exports = new UploadManager(); 