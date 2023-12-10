const conceptController = require('../controllers/conceptController');

const router = require('express').Router();
const {isStudentInSeminar} = require("../middleware/authMiddleware");

router.get('/newest/:seminarOID', isStudentInSeminar, conceptController.getNewestConceptOfCurrentUser);
router.post('/', isStudentInSeminar, conceptController.uploadConcept);

module.exports = router;
