const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function ca() {
  try {
    const hashedPassword = await bcrypt.hash('pass123', 10);

    const admin = await prisma.users.create({
      data: {
        email: 'solar@solar.pl',
        password_hash: hashedPassword,
        username: 'solar',
        role: 'ADMIN',
        status: 'active',
      },
    });

    console.log('✅ Admin created:', admin.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  ca();
}

module.exports = ca;
