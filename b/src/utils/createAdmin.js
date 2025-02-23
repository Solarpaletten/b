const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('pass123', 10);

    const admin = await prisma.users.create({
      data: {
        email: 'solar@solar.pl',
        password_hash: hashedPassword,
        username: 'solar',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Admin created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
