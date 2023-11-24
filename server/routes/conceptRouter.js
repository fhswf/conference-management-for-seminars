const conceptController = require('../controllers/conceptController');

const router = require('express').Router();

router.get('/', conceptController.getNewestConcept);
router.post('/', conceptController.uploadConcept);

module.exports = router;
