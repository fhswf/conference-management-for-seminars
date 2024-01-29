const paperController = require('../controllers/paperController');

const router = require('express').Router();
const {isStudentInSeminar, isSupervisorOrStudentInSeminar, isCourseAdminOrSupervisorInSeminar} = require('../middleware/authMiddleware');

router.get('/get-assigned-paper/:seminarOID', isSupervisorOrStudentInSeminar, paperController.getAssignedPaper);
router.get('/get-uploaded-paper/:seminarOID', isStudentInSeminar, paperController.getUploadedPaper);
router.get('/get-all-final-paper/:seminarOID', isCourseAdminOrSupervisorInSeminar, paperController.getAllFinalPaperZip);
router.post('/', isStudentInSeminar, paperController.uploadPaper);

module.exports = router;
