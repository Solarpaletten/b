const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(to, token) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Email Verification - Solar System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p>Thank you for registering! Please verify your email address by using the following verification token:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <code style="font-size: 16px; color: #333;">${token}</code>
            </div>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        `,
        text: `Your verification token is: ${token}`,
      });

      console.log('Verification email sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendTemporaryPassword(to, tempPassword) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Your Temporary Password - Solar System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Temporary Password</h2>
            <p>Here is your temporary password to access your account:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <code style="font-size: 16px; color: #333;">${tempPassword}</code>
            </div>
            <p style="color: #d73a49; margin-top: 20px;">🔔 Important Security Notice:</p>
            <ul style="color: #666;">
              <li>Please change this password immediately after logging in</li>
              <li>Never share your password with anyone</li>
              <li>Make sure to use a strong password</li>
            </ul>
            <p>If you didn't request this password reset, please contact support immediately.</p>
          </div>
        `,
        text: `Your temporary password is: ${tempPassword}\n\nIMPORTANT: Please change this password immediately after logging in.`,
      });

      console.log('Temporary password email sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending temporary password email:', error);
      throw error;
    }
  }

  async sendCompanyCreatedEmail(to, companyName) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: 'Company Created Successfully - Solar System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Company Registration Successful</h2>
            <p>Congratulations! Your company has been successfully registered in our system.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0;">Company Name:</h3>
              <p style="font-size: 16px; color: #333; margin: 10px 0 0 0;">${companyName}</p>
            </div>
            <p>You can now start managing your company through our platform.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
        `,
        text: `Congratulations! Your company "${companyName}" has been successfully registered in our system.`,
      });

      console.log('Company creation email sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending company creation email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
