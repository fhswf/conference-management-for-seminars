const seminarController = require('../controllers/seminarController');

const router = require('express').Router();
const {
    isMemberOfSeminar,
    isSystemAdmin,
    isCourseAdminInSeminar,
    isCourseAdminOrSupervisorInSeminar
} = require('../middleware/authMiddleware');

router.get('/get-seminar/:seminarOID', isMemberOfSeminar, seminarController.getSeminar);
router.get('/get-seminars', isSystemAdmin, seminarController.getSeminars);
router.post('/go-to-next-phase/:seminarOID', isCourseAdminInSeminar, seminarController.gotoNextPhase);


router.post('/update-user', isCourseAdminOrSupervisorInSeminar, seminarController.updateUserInSeminar);

router.get('/get-students-list/:seminarOID', isCourseAdminOrSupervisorInSeminar, seminarController.getUserList);
router.post('/evaluate-concept', isCourseAdminInSeminar, seminarController.evaluateConcept);
router.post('/seminar', isSystemAdmin, seminarController.createSeminar);
router.get('/get-assigned-seminars', seminarController.getAssignedSeminars);
router.get('/get-student/:seminarOID/:userOID', isCourseAdminOrSupervisorInSeminar, seminarController.getStudent);
router.post('/enter-seminar/:assignmentkey', seminarController.enterSeminar);


module.exports = router;
