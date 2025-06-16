const router=require('express').Router();
const { upload, pdfController,automated_answer,getAllUploadedDocs,getAllRagChats } = require('../controllers/pdfController');

router.post('/upload', upload.single('pdf'), pdfController);
router.post('/ask', automated_answer);
router.get('/getAllUploadedDocs', getAllUploadedDocs);
router.get('/getRagChatMessages', getAllRagChats);

module.exports = router;