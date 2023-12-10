const reviewController = require('../controllers/reviewController');

const router = require('express').Router();

const {isReviewerOrAuthorOfPaper, isCourseAdminOrSupervisorInSeminar} = require('../middleware/authMiddleware');

router.get('/get-reviewoids-from-paper/:paperOID', isReviewerOrAuthorOfPaper, reviewController.getReviewOIDsOfPaper);
router.get('/get-reviewer-of-paper/:paperOID', isCourseAdminOrSupervisorInSeminar, reviewController.getReviewerUserOfPaper);

module.exports = router;
