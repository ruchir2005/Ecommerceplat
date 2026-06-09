const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "dummy_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the order in DB and update status
      const order = await Order.findById(order_id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found in DB" });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: "success",
        updateTime: Date.now().toString(),
      };

      const updatedOrder = await order.save();
      res.json({ message: "Payment verified successfully", order: updatedOrder });
    } else {
      res.status(400).json({ message: "Invalid Signature" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Razorpay Client ID
// @route   GET /api/payment/config
// @access  Private
const getRazorpayClientId = (req, res) => {
  res.json({ clientId: process.env.RAZORPAY_KEY_ID || "dummy_key_id" });
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayClientId,
};
