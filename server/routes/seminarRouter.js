const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.get('/get-seminar', seminarController.getSeminar);
router.post('/set-phase/:seminaroid', seminarController.setPhase);


module.exports = router;