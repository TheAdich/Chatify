const router = require('express').Router();
const {login,register,findUser,updateuser}=require('../controllers/userController');
router.post('/login',login);
router.post('/register',register);
router.get('/find',findUser)
router.put('/updateuser',updateuser)
module.exports=router;