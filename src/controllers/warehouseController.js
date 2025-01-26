const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.warehouses.findMany({
      where: { user_id: req.user.userId },
      include: {
        client: true,
        responsible_person: true
      }
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await prisma.warehouses.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      include: {
        client: true,
        responsible_person: true
      }
    });
    
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      status,
      client_id,
      responsible_person_id
    } = req.body;
    
    const warehouse = await prisma.warehouses.create({
      data: {
        name,
        code,
        address,
        status,
        client_id: client_id ? parseInt(client_id) : null,
        responsible_person_id: responsible_person_id ? parseInt(responsible_person_id) : null,
        user_id: req.user.userId
      }
    });
    
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const warehouse = await prisma.warehouses.updateMany({
      where: {
        id: parseInt(id),
        user_id: req.user.userId
      },
      data: updateData
    });
    
    if (warehouse.count === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json({ message: 'Warehouse updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
};

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse
}; 