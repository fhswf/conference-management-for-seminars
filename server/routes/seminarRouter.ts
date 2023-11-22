import seminarController from '../controllers/seminarController';
import express from 'express';
const router = express.Router();

router.get('/get-seminar', seminarController.getSeminar);
router.post('/set-phase/:phase', seminarController.setPhase);
router.post('/update-person', seminarController.updatePersonInSeminar);
router.get('/get-students-list', seminarController.getPersonList);
router.post('/evaluate-concept', seminarController.evaluateConcept);
router.post('/seminar', seminarController.createSeminar);


module.exports = router;