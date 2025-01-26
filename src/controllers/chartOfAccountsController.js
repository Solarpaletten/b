const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await prisma.chart_of_accounts.findMany({
      where: { user_id: req.user.userId }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await prisma.chart_of_accounts.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

const createAccount = async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      account_type,
      parent_code
    } = req.body;
    
    const account = await prisma.chart_of_accounts.create({
      data: {
        code,
        name,
        type,
        account_type,
        parent_code,
        user_id: req.user.userId
      }
    });
    
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const account = await prisma.chart_of_accounts.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      data: updateData
    });
    
    if (account.count === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount
}; 