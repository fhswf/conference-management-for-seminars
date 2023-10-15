const personController = require('../controllers/personController.js');

const router = require('express').Router();

router.get('/get-person/:id', personController.getPersonById);

module.exports = router;