const userController = require('../controllers/userController.js');

const router = require('express').Router();
const {isMemberOfSeminar, isSystemAdmin} = require('../middleware/authMiddleware');

//router.get('/get-user/:id', userController.getUserById);
router.get('/get-supervisor-list/:seminarOID', isMemberOfSeminar, userController.getSupervisorList);
router.get('/get-addable-users/:seminarOID', isSystemAdmin, userController.getAddableUsers);
router.post('/assign-to-seminar', isSystemAdmin, userController.assignToSeminar);

module.exports = router;
