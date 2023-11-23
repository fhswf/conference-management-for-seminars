const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.get('/get-seminar', seminarController.getSeminar);
router.post('/set-phase/:phase', seminarController.setPhase);
router.post('/update-user', seminarController.updateUserInSeminar);
router.get('/get-students-list', seminarController.getUserList);
router.post('/evaluate-concept', seminarController.evaluateConcept);
router.post('/seminar', seminarController.createSeminar);


module.exports = router;
