const conceptController = require('../controllers/conceptController');

const router = require('express').Router();

router.get('/newest/:seminarOID', conceptController.getNewestConcept);
router.post('/', conceptController.uploadConcept);

module.exports = router;
