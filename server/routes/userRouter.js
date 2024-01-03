const userController = require('../controllers/userController.js');

const router = require('express').Router();
const {isMemberOfSeminar, isSystemAdmin} = require('../middleware/authMiddleware');

//router.get('/get-user/:id', userController.getUserById);


router.post('/assign-to-seminar', isSystemAdmin, userController.assignToSeminar);
router.get('/assigned-seminars', userController.getAssignedSeminars);

module.exports = router;
