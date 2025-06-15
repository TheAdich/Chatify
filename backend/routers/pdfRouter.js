const router=require('express').Router();
const { upload, pdfController,automated_answer } = require('../controllers/pdfController');

router.post('/upload', upload.single('pdf'), pdfController);
router.post('/ask', automated_answer);

module.exports = router;