import personController from '../controllers/personController';
import express from 'express';
const router = express.Router();


router.get('/get-person/:id', personController.getPersonById);
router.get('/get-supervisor-list/:seminarOID', personController.getSupervisorList);
router.get('/get-addable-users/:seminarOID', personController.getAddableUsers);
router.post('/assign-to-seminar', personController.assignToSeminar);

module.exports = router;