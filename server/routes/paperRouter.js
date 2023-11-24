const paperController = require('../controllers/paperController');

const router = require('express').Router();


router.get('/get-assigned-paper/:seminarOID', paperController.getAssignedPaper);
router.get('/get-uploaded-paper/:seminarOID', paperController.getUploadedPaper);
router.post('/', paperController.uploadPaper);

module.exports = router;
