const bcrypt = require('bcryptjs');

console.log('Gerando hashes das senhas...');
console.log('admin123:', bcrypt.hashSync('admin123', 10));
console.log('recepcao123:', bcrypt.hashSync('recepcao123', 10));