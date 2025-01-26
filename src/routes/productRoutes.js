const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Получение списка продуктов
router.get('/', auth, productController.getAllProducts);

// Создание продукта
router.post('/', auth, productController.createProduct);

// Получение продукта по ID
router.get('/:id', auth, productController.getProductById);

// Обновление продукта
router.put('/:id', auth, productController.updateProduct);

// Удаление продукта
router.delete('/:id', auth, productController.deleteProduct);

// Поиск продуктов
router.get('/search/:query', async (req, res) => {
  try {
    const products = await prismaManager.prisma.products.findMany({
      where: {
        OR: [
          { code: { contains: req.params.query } },
          { name: { contains: req.params.query } },
          { description: { contains: req.params.query } }
        ],
        is_active: true
      },
      take: 10,
      include: {
        users: {
          select: {
            username: true
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

module.exports = router; 