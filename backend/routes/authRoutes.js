const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');


router.post('/login',  ctrl.login);
router.get('/me', auth, ctrl.getMe);
router.post('/logout', auth, ctrl.logout);

module.exports = router;
// This code defines the authentication routes for the application.
// It imports the necessary modules, sets up a router, and defines a route for user login