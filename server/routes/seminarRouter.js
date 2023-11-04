const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.post('/set-phase/:seminaroid', seminarController.setPhase);


module.exports = router;