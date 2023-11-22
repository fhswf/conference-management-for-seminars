import paperController from '../controllers/paperController';
import express from 'express';
const router = express.Router();

router.get('/get-paper/:id', paperController.getPaperPdf);
router.get('/get-assigned-paper/', paperController.getAssignedPaper);
router.get('/get-uploaded-paper/', paperController.getUploadedPaper);
router.post('/upload-paper', paperController.uploadPaper);

module.exports = router;