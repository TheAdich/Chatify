const router=require('express').Router();
const {checkout,paymentVerification} =require('../controllers/paymentController')
router.post('/checkout',checkout);
router.post('/verification',paymentVerification);

module.exports=router;