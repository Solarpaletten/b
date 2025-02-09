// generateHash.js 
const bcrypt = require('bcryptjs');

const password = 'pass123';
const salt = 10;

const hash = bcrypt.hashSync(password, salt);
console.log('Password:', password);
console.log('Hash:', hash);