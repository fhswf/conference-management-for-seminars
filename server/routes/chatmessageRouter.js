const chatmessageController = require('../controllers/chatmessageController');

const router = require('express').Router();
const {isChatParticipant, isReviewerOrAuthorOfPaper} = require('../middleware/authMiddleware');

//Weil bisher kein Chat existieren könnte
// TODO check phase
// if phase = 5 only review is allowed to get messages
router.get('/:reviewOID', isReviewerOrAuthorOfPaper, chatmessageController.getMessagesOfReview);
// TODO check phase
// if phase = 5 only review is allowed to send messages
router.post('/', isReviewerOrAuthorOfPaper, chatmessageController.createMessage);

module.exports = router;
