const conceptController = require('../controllers/conceptController');

const router = require('express').Router();

router.get('/get-concept/', conceptController.getConcept);
router.get('/get-concept-pdf/:id', conceptController.getConceptPdf);
router.post('/upload-concept', conceptController.uploadConcept);

module.exports = router;