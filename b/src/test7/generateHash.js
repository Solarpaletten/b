const bcrypt = require('bcryptjs');

const password = 'pass123';
const salt = 10;

const hash = bcrypt.hashSync(password, salt);
console.log('Password:', password);
console.log('Hash:', hash);

const hash2 = bcrypt.hashSync(password, salt);
console.log('Hash2:', hash2);

const hash3 = bcrypt.hashSync(password, salt);
console.log('Hash3:', hash3);
