const router=require('express').Router();
const {fetchChat,accessChat,createChat,creategroup,getChatByquery,editGroup}=require('../controllers/chatController');
router.post('/userChat',accessChat);
router.get('/fetchChat',fetchChat);
router.post('/createchat',createChat);
router.post('/creategroup',creategroup)
router.get('/getChatbyquery',getChatByquery)
router.put('/editgroup',editGroup)
module.exports=router;