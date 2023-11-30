const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.get('/get-seminar/:seminarOID', seminarController.getSeminar);
router.post('/go-to-next-phase/:seminarOID', seminarController.gotoNextPhase);
router.post('/update-user', seminarController.updateUserInSeminar);
router.get('/get-students-list/:seminarOID', seminarController.getUserList);
router.post('/evaluate-concept', seminarController.evaluateConcept);
router.post('/seminar', seminarController.createSeminar);
router.get('/get-assigned-seminars', seminarController.getAssignedSeminars);


module.exports = router;
