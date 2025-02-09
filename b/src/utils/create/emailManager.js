const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
const { logger } = require('../config/logger');

class EmailManager {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.email = new Email({
      message: {
        from: process.env.SMTP_FROM
      },
      transport: this.transporter,
      views: {
        root: path.join(process.cwd(), 'src', 'templates', 'email'),
        options: {
          extension: 'ejs'
        }
      },
      preview: process.env.NODE_ENV === 'development'
    });

    this.templates = {
      welcome: {
        subject: 'Welcome to our platform!',
        template: 'welcome'
      },
      resetPassword: {
        subject: 'Password Reset Request',
        template: 'reset-password'
      },
      invoice: {
        subject: 'New Invoice',
        template: 'invoice'
      },
      report: {
        subject: 'Your Report',
        template: 'report'
      }
    };
  }

  // Отправка email с использованием шаблона
  async sendTemplateEmail(to, templateName, data = {}) {
    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const result = await this.email.send({
        template: template.template,
        message: {
          to,
          subject: template.subject
        },
        locals: {
          ...data,
          year: new Date().getFullYear()
        }
      });

      logger.info('Email sent successfully:', {
        to,
        template: templateName
      });

      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  // Отправка простого текстового email
  async sendSimpleEmail(to, subject, text, html = null) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html: html || text
      });

      logger.info('Simple email sent successfully:', { to, subject });
      return result;
    } catch (error) {
      logger.error('Error sending simple email:', error);
      throw error;
    }
  }

  // Отправка email с вложениями
  async sendEmailWithAttachments(to, subject, text, attachments) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        attachments
      });

      logger.info('Email with attachments sent successfully:', {
        to,
        subject,
        attachments: attachments.map(a => a.filename)
      });

      return result;
    } catch (error) {
      logger.error('Error sending email with attachments:', error);
      throw error;
    }
  }

  // Проверка соединения с SMTP сервером
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
      return true;
    } catch (error) {
      logger.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  // Отправка письма с подтверждением
  async sendVerificationEmail(email, token) {
    try {
      const verificationUrl = `${process.env.APP_URL}/verify-email/${token}`;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Verify your email',
        html: `
          <h1>Welcome!</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `
      });

      logger.info('Verification email sent:', { email });
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Отправка письма для сброса пароля
  async sendPasswordResetEmail(email, token) {
    try {
      const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      logger.info('Password reset email sent:', { email });
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Отправка уведомлений
  async sendNotification(email, subject, message) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html: message
      });

      logger.info('Notification email sent:', { email, subject });
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }
}

module.exports = new EmailManager(); 