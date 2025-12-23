const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');


// Routes for user management
// Only accessible by admin users
router.get('/', auth,  ctrl.getUsers);
router.get('/:id', auth, ctrl.getUserById);
router.post('/', auth, ctrl.addUser);
router.put('/:id', auth, ctrl.updateUser);
router.patch('/:id/toggle', auth, ctrl.toggleUserStatus);
// router.patch('/:id/status', auth, ctrl.toggleUserStatus);
router.delete('/:id', auth, ctrl.deleteUser);

module.exports = router;