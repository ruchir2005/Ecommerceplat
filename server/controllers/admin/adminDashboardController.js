const Product = require("../../models/Product");
const Order = require("../../models/Order");
const User = require("../../models/User");

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    const orderStatusCounts = {
      Processing: await Order.countDocuments({ orderStatus: "Processing" }),
      Shipped: await Order.countDocuments({ orderStatus: "Shipped" }),
      Delivered: await Order.countDocuments({ orderStatus: "Delivered" }),
      Cancelled: await Order.countDocuments({ orderStatus: "Cancelled" }),
    };

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      orderStatusCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
