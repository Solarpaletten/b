// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prismaManager = require('../utils/create/prismaManager');
const { logger } = require('../config/logger');
const emailService = require('../services/emailService');
const { generateTemporaryPassword } = require('../utils/create/tokenGenerator');

class AuthController {
  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = await prismaManager.prisma.users.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prismaManager.prisma.users.create({
        data: {
          email,
          username,
          password_hash: passwordHash,
          verification_token: crypto.randomBytes(32).toString('hex'),
          token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          role: 'USER',
          email_verified: process.env.NODE_ENV === 'test'
        }
      });

      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendVerification(user.email, user.verification_token);
        } catch (error) {
          logger.error('Failed to send verification email:', error);
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Registration error:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({ error: 'Registration failed' });
    }
  }

async login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Логируем попытку входа
    logger.info('Login attempt:', { email });

    const user = await prismaManager.prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn('Login failed: User not found', { email });
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password', { email });
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    if (!user.email_verified) {
      logger.warn('Login failed: Email not verified', { email });
      return res.status(403).json({ message: 'Пожалуйста, подтвердите email' });
    }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    
      } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера при попытке входа' });
  }
}

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await prismaManager.prisma.users.findFirst({
        where: {
          verification_token: token,
          token_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      await prismaManager.prisma.users.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          verification_token: null,
          token_expires: null
        }
      });

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await prismaManager.prisma.users.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

      await prismaManager.prisma.users.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expires: tokenExpires
        }
      });

      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendPasswordReset(user.email, resetToken);
        } catch (error) {
          logger.error('Failed to send password reset email:', error);
        }
      }

      res.json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await prismaManager.prisma.users.findFirst({
        where: {
          reset_token: token,
          reset_token_expires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await prismaManager.prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null
        }
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await prismaManager.prisma.users.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          email_verified: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  async createTemporaryPassword(req, res) {
    try {
      const { email } = req.body;
      const tempPassword = generateTemporaryPassword();

      if (process.env.NODE_ENV !== 'test') {
        try {
          await emailService.sendTemporaryPassword(email, tempPassword);
        } catch (error) {
          logger.error('Failed to send temporary password email:', error);
        }
      }
      
      res.json({ 
        message: 'Temporary password sent to your email'
      });
    } catch (error) {
      logger.error('Create temporary password error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();