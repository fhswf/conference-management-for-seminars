const chatmessageController = require('../controllers/chatmessageController');

const router = require('express').Router();
const {isChatParticipant, isReviewerOrAuthorOfPaper} = require('../middleware/authMiddleware');

//Weil bisher kein Chat existieren könnte
// TODO check phase
// if phase = 5 only reviewer is allowed to get messages
// if phase = 6, author is allowed to get messages
router.get('/:reviewOID', isReviewerOrAuthorOfPaper, chatmessageController.getMessagesOfReview);
// TODO check phase
// if phase = 5 only reviewer is allowed to send messages
// if phase = 6, author is allowed to get messages
router.post('/', isReviewerOrAuthorOfPaper, chatmessageController.createMessage);

module.exports = router;
