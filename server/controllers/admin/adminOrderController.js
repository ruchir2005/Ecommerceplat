const Order = require("../../models/Order");

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (req.body.isPaid !== undefined) {
      order.isPaid = req.body.isPaid;
      if (req.body.isPaid) {
        order.paidAt = Date.now();
      }
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/admin/orders/:id
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllOrders, updateOrderStatus, deleteOrder };
