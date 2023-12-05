const reviewController = require('../controllers/reviewController');

const router = require('express').Router();

router.get('/get-from-paper/:paperOID', reviewController.getReviewsOfPaper);

module.exports = router;
