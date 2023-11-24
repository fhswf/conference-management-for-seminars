const attachmentController = require('../controllers/attachmentController');

const router = require('express').Router();

router.get('/:attachmentOID', attachmentController.getAttachment);

module.exports = router;
