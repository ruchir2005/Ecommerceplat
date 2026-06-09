const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayClientId,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.get('/config', protect, getRazorpayClientId);

module.exports = router;
