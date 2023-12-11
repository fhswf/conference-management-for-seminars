const reviewController = require('../controllers/reviewController');

const router = require('express').Router();

const {isReviewerOrAuthorOfPaper, isCourseAdminOrSupervisorInSeminar, isReviewer} = require('../middleware/authMiddleware');

router.get('/get-reviewoids-from-paper/:paperOID', isReviewerOrAuthorOfPaper, reviewController.getReviewOIDsOfPaper);
router.get('/get-reviewer-of-paper/:paperOID', isCourseAdminOrSupervisorInSeminar, reviewController.getReviewerUserOfPaper);
router.post('/rate',  reviewController.rateReview);

module.exports = router;
