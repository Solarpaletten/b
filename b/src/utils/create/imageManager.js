const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/logger');

class ImageManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'images');
    this.cacheDir = path.join(process.cwd(), 'cache', 'images');
    this.maxWidth = 2000;
    this.maxHeight = 2000;
    this.quality = 80;

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing image directories:', error);
      throw error;
    }
  }

  // Обработка изображения
  async processImage(inputPath, options = {}) {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Применяем преобразования
      if (options.resize) {
        image.resize({
          width: Math.min(options.resize.width || this.maxWidth, this.maxWidth),
          height: Math.min(
            options.resize.height || this.maxHeight,
            this.maxHeight
          ),
          fit: options.resize.fit || 'cover',
          position: options.resize.position || 'center',
        });
      }

      if (options.rotate) {
        image.rotate(options.rotate);
      }

      if (options.flip) {
        image.flip();
      }

      if (options.flop) {
        image.flop();
      }

      if (options.sharpen) {
        image.sharpen(options.sharpen);
      }

      if (options.blur) {
        image.blur(options.blur);
      }

      if (options.gamma) {
        image.gamma(options.gamma);
      }

      // Применяем формат и качество
      const format = options.format || metadata.format;
      const quality = options.quality || this.quality;

      image.toFormat(format, { quality });

      // Сохраняем результат
      const filename = `${path.parse(inputPath).name}-${Date.now()}.${format}`;
      const outputPath = path.join(this.outputDir, filename);

      await image.toFile(outputPath);
      return outputPath;
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  // Создание миниатюры
  async createThumbnail(inputPath, options = {}) {
    try {
      const width = options.width || 150;
      const height = options.height || 150;
      const format = options.format || 'jpeg';

      const image = sharp(inputPath);
      const filename = `thumb-${
        path.parse(inputPath).name
      }-${Date.now()}.${format}`;
      const outputPath = path.join(this.cacheDir, filename);

      await image
        .resize(width, height, { fit: 'cover' })
        .toFormat(format, { quality: this.quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      logger.error('Error creating thumbnail:', error);
      throw error;
    }
  }

  // Добавление водяного знака
  async addWatermark(inputPath, watermarkPath, options = {}) {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const watermark = await sharp(watermarkPath)
        .resize(Math.floor(metadata.width * 0.3)) // 30% от ширины изображения
        .toBuffer();

      const filename = `watermarked-${
        path.parse(inputPath).name
      }-${Date.now()}.${metadata.format}`;
      const outputPath = path.join(this.outputDir, filename);

      await image
        .composite([
          {
            input: watermark,
            gravity: options.gravity || 'southeast',
            blend: options.blend || 'over',
          },
        ])
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      logger.error('Error adding watermark:', error);
      throw error;
    }
  }

  // Оптимизация изображения
  async optimize(inputPath, options = {}) {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const filename = `optimized-${path.parse(inputPath).name}-${Date.now()}.${
        metadata.format
      }`;
      const outputPath = path.join(this.outputDir, filename);

      await image
        .toFormat(metadata.format, {
          quality: options.quality || 70,
          chromaSubsampling: '4:2:0',
        })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  // Конвертация формата
  async convert(inputPath, format, options = {}) {
    try {
      const image = sharp(inputPath);
      const filename = `converted-${
        path.parse(inputPath).name
      }-${Date.now()}.${format}`;
      const outputPath = path.join(this.outputDir, filename);

      await image.toFormat(format, options).toFile(outputPath);

      return outputPath;
    } catch (error) {
      logger.error('Error converting image:', error);
      throw error;
    }
  }

  // Получение метаданных изображения
  async getMetadata(inputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      return metadata;
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      throw error;
    }
  }
}

module.exports = new ImageManager();
