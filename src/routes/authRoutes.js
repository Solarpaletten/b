const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const prismaManager = require('../utils/create/prismaManager');

// Основные маршруты аутентификации
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);

// Только эти три маршрута, так как только они определены в контроллере
// Остальные добавим позже, когда реализуем их в контроллере

module.exports = router;