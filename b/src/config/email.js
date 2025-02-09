const nodemailer = require('nodemailer');

const emailConfig = {
  service: 'gmail',
  auth: {
    user: 'solarleanid@gmail.com',
    // Важно: для Gmail нужно использовать пароль приложения, а не обычный пароль аккаунта
    // Нужно включить двухфакторную аутентификацию и создать пароль приложения
    pass: 'SolarLeanid@$'
  }
};

const transporter = nodemailer.createTransport(emailConfig);

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'your-email@example.com',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  transporter
}; 