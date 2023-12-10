const attachmentController = require('../controllers/attachmentController');

const router = require('express').Router();
const {isPermittedToAccessFile} = require("../middleware/authMiddleware");

router.get('/:attachmentOID', isPermittedToAccessFile, attachmentController.getAttachment);



module.exports = router;
