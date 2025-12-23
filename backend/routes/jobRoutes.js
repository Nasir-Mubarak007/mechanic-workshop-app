const router = require('express').Router();
const ctrl = require('../controllers/jobController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getJobs);
router.get('/staff/:staff', auth, ctrl.getJobsByStaff);
router.get('/date/:date', auth, ctrl.getJobsByDate);

router.post('/', auth, ctrl.addJob);
router.put('/:id', auth, ctrl.updateJob);
router.get('/:id', auth, ctrl.getJobById);
router.delete('/:id', auth, ctrl.deleteJob);

module.exports = router;
