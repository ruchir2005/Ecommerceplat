const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus, deleteOrder } = require("../../controllers/admin/adminOrderController");
const { protect, admin } = require("../../middleware/authMiddleware");

router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;
