import conceptController from '../controllers/conceptController';
import express from 'express';
const router = express.Router();

router.get('/get-concept/', conceptController.getConcept);
router.get('/get-concept-pdf/:id', conceptController.getConceptPdf);
router.post('/upload-concept', conceptController.uploadConcept);

module.exports = router;