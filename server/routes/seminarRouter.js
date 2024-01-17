const seminarController = require('../controllers/seminarController');

const router = require('express').Router();
const {
    isMemberOfSeminar,
    isSystemAdmin,
    isCourseAdminInSeminar,
    isCourseAdminOrSupervisorInSeminar
} = require('../middleware/authMiddleware');


router.get('/all', isSystemAdmin, seminarController.getSeminars);
router.get('/:seminarOID', isMemberOfSeminar, seminarController.getSeminar);
router.post('/:seminarOID/go-to-next-phase/', isCourseAdminInSeminar, seminarController.gotoNextPhase);


router.post('/update-user', isCourseAdminOrSupervisorInSeminar, seminarController.updateUserInSeminar);

router.get('/:seminarOID/participants', isCourseAdminOrSupervisorInSeminar, seminarController.getUserList);
router.post('/evaluate-concept', isCourseAdminInSeminar, seminarController.evaluateConcept);
router.post('/', isSystemAdmin, seminarController.createSeminar);

router.get('/:seminarOID/get-student/:userOID', isCourseAdminOrSupervisorInSeminar, seminarController.getStudent);
router.post('/enter-seminar/:assignmentkey', seminarController.enterSeminar);
router.get('/:seminarOID/supervisor-list', isMemberOfSeminar, seminarController.getSupervisorList);

router.get('/:seminarOID/addable-users/', isSystemAdmin, seminarController.getAddableUsers);


module.exports = router;
