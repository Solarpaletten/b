const crypto = require('crypto');
const { logger } = require('../config/logger');

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // для AES-256
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
    this.encoding = 'hex';

    // Получаем ключ шифрования из переменных окружения или генерируем новый
    this.secretKey =
      process.env.ENCRYPTION_KEY ||
      crypto.randomBytes(this.keyLength).toString(this.encoding);
  }

  // Генерация ключа на основе пароля
  async generateKey(password, salt) {
    try {
      return crypto.pbkdf2Sync(
        password,
        salt,
        100000, // количество итераций
        this.keyLength,
        'sha512'
      );
    } catch (error) {
      logger.error('Error generating key:', error);
      throw error;
    }
  }

  // Шифрование данных
  async encrypt(data, customKey = null) {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      const key = customKey || this.secretKey;

      const derivedKey = await this.generateKey(key, salt);
      const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv);

      let encrypted = cipher.update(
        typeof data === 'string' ? data : JSON.stringify(data),
        'utf8',
        this.encoding
      );
      encrypted += cipher.final(this.encoding);

      const tag = cipher.getAuthTag();

      // Формируем зашифрованный пакет
      const encryptedData = {
        salt: salt.toString(this.encoding),
        iv: iv.toString(this.encoding),
        tag: tag.toString(this.encoding),
        data: encrypted,
      };

      return JSON.stringify(encryptedData);
    } catch (error) {
      logger.error('Encryption error:', error);
      throw error;
    }
  }

  // Расшифровка данных
  async decrypt(encryptedPackage, customKey = null) {
    try {
      const { salt, iv, tag, data } = JSON.parse(encryptedPackage);
      const key = customKey || this.secretKey;

      const derivedKey = await this.generateKey(
        key,
        Buffer.from(salt, this.encoding)
      );
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        derivedKey,
        Buffer.from(iv, this.encoding)
      );

      decipher.setAuthTag(Buffer.from(tag, this.encoding));

      let decrypted = decipher.update(data, this.encoding, 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      logger.error('Decryption error:', error);
      throw error;
    }
  }

  // Хеширование данных
  async hash(data, salt = null) {
    try {
      const useSalt = salt || crypto.randomBytes(this.saltLength);
      const hash = crypto.pbkdf2Sync(data, useSalt, 100000, 64, 'sha512');

      return {
        hash: hash.toString(this.encoding),
        salt: useSalt.toString(this.encoding),
      };
    } catch (error) {
      logger.error('Hashing error:', error);
      throw error;
    }
  }

  // Проверка хеша
  async verifyHash(data, hash, salt) {
    try {
      const verificationHash = await this.hash(
        data,
        Buffer.from(salt, this.encoding)
      );
      return verificationHash.hash === hash;
    } catch (error) {
      logger.error('Hash verification error:', error);
      throw error;
    }
  }

  // Генерация случайного токена
  generateToken(length = 32) {
    try {
      return crypto.randomBytes(length).toString(this.encoding);
    } catch (error) {
      logger.error('Token generation error:', error);
      throw error;
    }
  }
}

module.exports = new EncryptionManager();
