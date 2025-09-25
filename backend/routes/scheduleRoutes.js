const router = require('express').Router();
const ctrl = require('../controllers/scheduleController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getScheduledServices);
router.get('/date/:date', auth, ctrl.getByDate);
router.get('/today', auth, ctrl.getTodaysAppointments);
router.get('/upcoming', auth, ctrl.getUpcomingAppointments);

router.post('/', auth, ctrl.addScheduledService);
router.put('/:id', auth, ctrl.updateScheduledService);
router.patch('/:id/status', auth, ctrl.updateAppointmentStatus);
router.delete('/:id', auth, ctrl.deleteScheduledService);

module.exports = router;
