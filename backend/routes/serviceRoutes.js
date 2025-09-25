const router = require('express').Router();
const ctrl = require('../controllers/serviceController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getServices);
router.get('/active', auth, ctrl.getActiveServices);
router.post('/', auth, ctrl.addService);
router.put('/:id', auth, ctrl.updateService);
router.patch('/:id/toggle', auth, ctrl.toggleServiceStatus);
router.delete('/:id', auth, ctrl.deleteService);

module.exports = router;