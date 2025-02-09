const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

const getAllClients = async (req, res) => {
  try {
    const clients = await prismaManager.prisma.clients.findMany({
      where: { user_id: req.user.id },
      include: {
        sales: true,
        purchases: true
      }
    });
    res.json(clients);
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prismaManager.prisma.clients.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.id
      },
      include: {
        sales: true,
        purchases: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      type,
      clientType,
      code,
      vat_code
    } = req.body;
    
    const client = await prismaManager.prisma.clients.create({
      data: {
        name,
        email,
        phone,
        type,
        clientType,
        code,
        vat_code,
        user_id: req.user.id,
        is_active: true
      }
    });
    
    res.status(201).json(client);
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const client = await prismaManager.prisma.clients.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.id
      },
      data: updateData
    });
    
    if (client.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prismaManager.prisma.clients.deleteMany({
      where: {
        id: parseInt(id),
        user_id: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

module.exports = {
  getAllClients, // Получение всех клиентов
  getClientById, // Получение клиента по ID
  createClient, // Создание клиента
  updateClient, // Обновление клиента
  deleteClient // Удаление клиента
};