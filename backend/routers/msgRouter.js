const router=require('express').Router();
const {allMessages,postMessages}=require('../controllers/msgController');
router.get('/getmessage',allMessages);
router.post('/postmessage',postMessages);
module.exports = router;