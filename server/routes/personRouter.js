const personController = require('../controllers/personController.js');

const router = require('express').Router();

router.get('/get-person/:id', personController.getPersonById);
router.get('/get-supervisor-list/:seminarOID', personController.getSupervisorList);

module.exports = router;