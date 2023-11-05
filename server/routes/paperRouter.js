const paperController = require('../controllers/paperController');

const router = require('express').Router();

router.get('/get-paper/:id', paperController.getPaperPdf);
router.get('/get-assigned-paper/', paperController.getAssignedPaper);
router.post('/upload-paper', paperController.uploadPaper);

module.exports = router;