const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllBankOperations = async (req, res) => {
  try {
    const operations = await prisma.bank_operations.findMany({
      where: { user_id: req.user.userId },
      include: {
        client: true
      }
    });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank operations' });
  }
};

const getBankOperationById = async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await prisma.bank_operations.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      include: {
        client: true
      }
    });
    
    if (!operation) {
      return res.status(404).json({ error: 'Bank operation not found' });
    }
    
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank operation' });
  }
};

const createBankOperation = async (req, res) => {
  try {
    const {
      date,
      description,
      amount,
      type,
      account_id,
      client_id
    } = req.body;
    
    const operation = await prisma.bank_operations.create({
      data: {
        date: new Date(date),
        description,
        amount,
        type,
        account_id: parseInt(account_id),
        client_id: client_id ? parseInt(client_id) : null,
        user_id: req.user.userId
      }
    });
    
    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank operation' });
  }
};

const updateBankOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    
    const operation = await prisma.bank_operations.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      data: updateData
    });
    
    if (operation.count === 0) {
      return res.status(404).json({ error: 'Bank operation not found' });
    }
    
    res.json({ message: 'Bank operation updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank operation' });
  }
};

module.exports = {
  getAllBankOperations,
  getBankOperationById,
  createBankOperation,
  updateBankOperation
}; 