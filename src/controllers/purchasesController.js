const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchases.findMany({
      where: { user_id: req.user.userId },
      include: {
        client: true,
        warehouse: true
      }
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchases.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      include: {
        client: true,
        warehouse: true
      }
    });
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
};

const createPurchase = async (req, res) => {
  try {
    const {
      doc_number,
      doc_date,
      purchase_date,
      client_id,
      warehouse_id,
      total_amount,
      currency,
      invoice_type,
      invoice_number,
      vat_rate
    } = req.body;
    
    const purchase = await prisma.purchases.create({
      data: {
        doc_number,
        doc_date: new Date(doc_date),
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        client_id: parseInt(client_id),
        warehouse_id: parseInt(warehouse_id),
        total_amount,
        currency,
        invoice_type,
        invoice_number,
        vat_rate,
        user_id: req.user.userId
      }
    });
    
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase' });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.doc_date) {
      updateData.doc_date = new Date(updateData.doc_date);
    }
    if (updateData.purchase_date) {
      updateData.purchase_date = new Date(updateData.purchase_date);
    }
    
    const purchase = await prisma.purchases.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      data: updateData
    });
    
    if (purchase.count === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    res.json({ message: 'Purchase updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase' });
  }
};

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase
}; 