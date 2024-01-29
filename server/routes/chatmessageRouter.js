const chatmessageController = require('../controllers/chatmessageController');

const router = require('express').Router();
const {isReviewerOrAuthorOfPaper, isAllowedToGetOrCreateMessage} = require('../middleware/authMiddleware');

router.get('/:reviewOID', isReviewerOrAuthorOfPaper, isAllowedToGetOrCreateMessage, chatmessageController.getMessagesOfReview);
router.post('/', isReviewerOrAuthorOfPaper, isAllowedToGetOrCreateMessage, chatmessageController.createMessage);

module.exports = router;
