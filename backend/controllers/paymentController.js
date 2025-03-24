
const instance = require('../razoprpayInstance');
const Payment=require('../models/PaymentModel');
const crypto=require('crypto');
const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),  // amount in the smallest currency unit
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
}

const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RZ_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
  if (isAuthentic) {
    // Database comes here

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(
      `https://chatify-henna.vercel.app/chat`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
}
module.exports = { checkout,paymentVerification };