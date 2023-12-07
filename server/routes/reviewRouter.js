const reviewController = require('../controllers/reviewController');

const router = require('express').Router();

router.get('/get-from-reviews-paper/:paperOID', reviewController.getReviewsOfPaper);

module.exports = router;
