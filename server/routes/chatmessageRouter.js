const chatmessageController = require('../controllers/chatmessageController');

const router = require('express').Router();

router.get('/:reviewOID', chatmessageController.getMessagesOfReview);
router.post('/', chatmessageController.createMessage);

module.exports = router;
