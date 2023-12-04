const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.get('/get-seminar/:seminarOID', seminarController.getSeminar);
router.get('/get-seminars', seminarController.getSeminars);
router.post('/go-to-next-phase/:seminarOID', seminarController.gotoNextPhase);
router.post('/update-user', seminarController.updateUserInSeminar);
router.get('/get-students-list/:seminarOID', seminarController.getUserList);
router.post('/evaluate-concept', seminarController.evaluateConcept);
router.post('/seminar', seminarController.createSeminar);
router.get('/get-assigned-seminars', seminarController.getAssignedSeminars);
router.get('/get-student/:seminarOID/:userOID', seminarController.getStudent);


module.exports = router;
