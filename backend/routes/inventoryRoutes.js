const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getInventoryItems);
router.get('/available', auth, ctrl.getAvailableItems);
router.get('/low-stock', auth, ctrl.getLowStockItems);

router.post('/', auth, ctrl.addInventoryItem);
router.put('/:id', auth, ctrl.updateInventoryItem);
router.patch('/:id/restock', auth, ctrl.restockInventoryItem);
router.delete('/:id', auth, ctrl.deleteInventoryItem);
router.patch('/:id/toggle', auth, ctrl.toggleInventoryItemStatus);

module.exports = router;