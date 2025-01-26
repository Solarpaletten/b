const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.sales.findMany({
      where: { user_id: req.user.userId },
      include: {
        client: true,
        warehouse: true
      }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sales.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      include: {
        client: true,
        warehouse: true
      }
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
};

const createSale = async (req, res) => {
  try {
    const {
      doc_number,
      doc_date,
      sale_date,
      client_id,
      warehouse_id,
      total_amount,
      currency,
      invoice_type,
      invoice_number,
      vat_rate
    } = req.body;
    
    const sale = await prisma.sales.create({
      data: {
        doc_number,
        doc_date: new Date(doc_date),
        sale_date: sale_date ? new Date(sale_date) : null,
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
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.doc_date) {
      updateData.doc_date = new Date(updateData.doc_date);
    }
    if (updateData.sale_date) {
      updateData.sale_date = new Date(updateData.sale_date);
    }
    
    const sale = await prisma.sales.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      data: updateData
    });
    
    if (sale.count === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sale' });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale
}; 