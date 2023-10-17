const paperController = require('../controllers/paperController');

const router = require('express').Router();

router.get('/get-paper/', paperController.getPaper);
router.post('/upload-paper', paperController.uploadPaper);

module.exports = router;