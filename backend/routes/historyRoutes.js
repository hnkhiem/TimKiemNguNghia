const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controllers
const {
    logUploadOrDelete,
    getUploadLogs,
    deleteFiles,
    logDownload,
    getDownloadHistory
  } = require('../controllers/historyController');


  

  // === HISTORY ===
router.post('/uploads', logUploadOrDelete);
router.get('/uploads', getUploadLogs);
router.post('/uploads/delete', deleteFiles);

router.post('/downloads', logDownload);
router.post('/downloads/user', getDownloadHistory);


module.exports = router;
