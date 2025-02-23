const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyEmail = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email address before continuing',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Email verification check failed' });
  }
};

module.exports = {
  verifyEmail,
};
