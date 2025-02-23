// /b/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, clientController.getClients);
router.get('/:id', authenticateToken, clientController.getClientById);
router.post('/', authenticateToken, clientController.createClient);
router.put('/:id', authenticateToken, clientController.updateClient);
router.delete('/:id', authenticateToken, clientController.deleteClient);
router.post('/:id/copy', authenticateToken, clientController.copyClient);

module.exports = router;
