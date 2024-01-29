const paperController = require('../controllers/paperController');

const router = require('express').Router();
const {isStudentInSeminar, isSupervisorOrStudentInSeminar} = require('../middleware/authMiddleware');

router.get('/get-assigned-paper/:seminarOID', isSupervisorOrStudentInSeminar, paperController.getAssignedPaper);
router.get('/get-uploaded-paper/:seminarOID', isStudentInSeminar, paperController.getUploadedPaper);
router.post('/', isStudentInSeminar, paperController.uploadPaper);

module.exports = router;
