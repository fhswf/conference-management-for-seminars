const seminarController = require('../controllers/seminarController');

const router = require('express').Router();

router.get('/get-seminar', seminarController.getSeminar);
router.post('/set-phase/:phase', seminarController.setPhase);
router.post('/update-person', seminarController.updatePersonInSeminar);
router.get('/get-students-list', seminarController.getPersonList);
router.post('/evaluate-concept', seminarController.evaluateConcept);


module.exports = router;