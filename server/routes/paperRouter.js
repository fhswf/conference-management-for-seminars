const paperController = require('../controllers/paperController');

const router = require('express').Router();
const {isStudentInSeminar} = require('../middleware/authMiddleware');


// TODO check phase, if student or supervisor
router.get('/get-assigned-paper/:seminarOID', paperController.getAssignedPaper);
router.get('/get-uploaded-paper/:seminarOID', isStudentInSeminar, paperController.getUploadedPaper);
// TODO check if  Seminar is in phase 3 or 7
router.post('/', isStudentInSeminar, paperController.uploadPaper);

module.exports = router;
