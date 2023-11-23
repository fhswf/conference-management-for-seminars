const userController = require('../controllers/userController.js');

const router = require('express').Router();

router.get('/get-user/:id', userController.getUserById);
router.get('/get-supervisor-list/:seminarOID', userController.getSupervisorList);
router.get('/get-addable-users/:seminarOID', userController.getAddableUsers);
router.post('/assign-to-seminar', userController.assignToSeminar);

module.exports = router;
