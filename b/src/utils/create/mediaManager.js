const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/logger');

class MediaManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'media');
    this.tempDir = path.join(process.cwd(), 'temp', 'media');

    // Устанавливаем пути к ffmpeg
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    }
    if (process.env.FFPROBE_PATH) {
      ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    }

    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Error initializing media directories:', error);
      throw error;
    }
  }

  // Получение метаданных медиафайла
  async getMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error('Error getting media metadata:', err);
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  // Конвертация видео
  async convertVideo(inputPath, options = {}) {
    try {
      const filename = `converted-${Date.now()}.${options.format || 'mp4'}`;
      const outputPath = path.join(this.outputDir, filename);

      return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
          .output(outputPath)
          .videoCodec(options.videoCodec || 'libx264')
          .audioCodec(options.audioCodec || 'aac');

        if (options.resolution) {
          command = command.size(options.resolution);
        }

        if (options.videoBitrate) {
          command = command.videoBitrate(options.videoBitrate);
        }

        if (options.audioBitrate) {
          command = command.audioBitrate(options.audioBitrate);
        }

        command
          .on('end', () => {
            logger.info('Video conversion completed:', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('Video conversion error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error converting video:', error);
      throw error;
    }
  }

  // Извлечение аудио из видео
  async extractAudio(inputPath, options = {}) {
    try {
      const filename = `audio-${Date.now()}.${options.format || 'mp3'}`;
      const outputPath = path.join(this.outputDir, filename);

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat(options.format || 'mp3')
          .audioCodec(options.codec || 'libmp3lame')
          .audioBitrate(options.bitrate || '128k')
          .output(outputPath)
          .on('end', () => {
            logger.info('Audio extraction completed:', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('Audio extraction error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error extracting audio:', error);
      throw error;
    }
  }

  // Создание превью видео
  async createThumbnail(inputPath, options = {}) {
    try {
      const filename = `thumbnail-${Date.now()}.jpg`;
      const outputPath = path.join(this.outputDir, filename);

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshots({
            timestamps: [options.timestamp || '00:00:01'],
            filename: filename,
            folder: this.outputDir,
            size: options.size || '320x240',
          })
          .on('end', () => {
            logger.info('Thumbnail creation completed:', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('Thumbnail creation error:', err);
            reject(err);
          });
      });
    } catch (error) {
      logger.error('Error creating thumbnail:', error);
      throw error;
    }
  }

  // Обрезка видео
  async trimVideo(inputPath, startTime, duration) {
    try {
      const filename = `trimmed-${Date.now()}.mp4`;
      const outputPath = path.join(this.outputDir, filename);

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(duration)
          .output(outputPath)
          .on('end', () => {
            logger.info('Video trimming completed:', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('Video trimming error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error trimming video:', error);
      throw error;
    }
  }

  // Объединение видео
  async mergeVideos(inputPaths, options = {}) {
    try {
      const filename = `merged-${Date.now()}.mp4`;
      const outputPath = path.join(this.outputDir, filename);
      const listPath = path.join(this.tempDir, 'files.txt');

      // Создаем файл со списком видео для объединения
      const fileList = inputPaths.map((p) => `file '${p}'`).join('\n');
      await fs.writeFile(listPath, fileList);

      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(listPath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .output(outputPath)
          .on('end', async () => {
            await fs.unlink(listPath);
            logger.info('Video merging completed:', { outputPath });
            resolve(outputPath);
          })
          .on('error', (err) => {
            logger.error('Video merging error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error merging videos:', error);
      throw error;
    }
  }
}

module.exports = new MediaManager();
