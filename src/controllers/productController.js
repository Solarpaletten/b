const prismaManager = require('../utils/create/prismaManager'); 
const { logger } = require('../config/logger');

const getAllProducts = async (req, res) => {
  try {
    const products = await prismaManager.prisma.products.findMany({
      where: { user_id: req.user.id }
    });
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prismaManager.prisma.products.findFirst({
      where: {
        id: parseInt(req.params.id),
        user_id: req.user.id
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await prismaManager.prisma.products.create({
      data: {
        ...req.body,
        user_id: req.user.id
      }
    });
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await prismaManager.prisma.products.updateMany({
      where: {
        id: parseInt(req.params.id),
        user_id: req.user.id
      },
      data: req.body
    });
    if (product.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await prismaManager.prisma.products.deleteMany({
      where: {
        id: parseInt(req.params.id),
        user_id: req.user.id
      }
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}; 