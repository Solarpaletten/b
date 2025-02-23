const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const password = 'pass123';

// Генерируем токен на основе пароля
const token = crypto.createHash('sha256').update(password).digest('hex');

console.log('Password:', password);
console.log('Token:', token);

// Создаем JWT с этим паролем
const user = {
  id: 1,
  email: 'test@example.com',
  password: password,
};

const jwtToken = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  password, // используем pass123 как секретный ключ
  { expiresIn: '24h' }
);

console.log('JWT Token:', jwtToken);

module.exports = {
  token,
  jwtToken,
};
