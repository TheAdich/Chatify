const Razorpay=require('razorpay');
require('dotenv').config()
const instance = new Razorpay({
    key_id: process.env.RZ_KEY_ID,
    key_secret: process.env.RZ_SECRET_KEY,
});
module.exports=instance;