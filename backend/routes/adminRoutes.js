const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All admin routes require login + admin role
const adminOnly = [protect, authorizeRoles("admin")];

// -----------------------------------------------
// @route   GET /api/admin/stats
// @desc    Dashboard overview stats (Feature 9)
// @access  Admin
// -----------------------------------------------
router.get("/stats", adminOnly, async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: "customer" });
    const totalVendors  = await User.countDocuments({ role: "vendor" });
    const totalProducts = await Product.countDocuments();
    const totalOrders   = await Order.countDocuments();

    // Sum all finalPrice values to get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Count pending vendor approvals
    const pendingVendors = await User.countDocuments({ role: "vendor", isApproved: false });

    res.json({ totalUsers, totalVendors, totalProducts, totalOrders, totalRevenue, pendingVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
// -----------------------------------------------
router.get("/users", adminOnly, async (req, res) => {
  try {
    // Optional filter by role: ?role=vendor
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/admin/users/:id/approve
// @desc    Approve a vendor account
// @access  Admin
// -----------------------------------------------
router.put("/users/:id/approve", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "vendor") return res.status(400).json({ message: "User is not a vendor" });

    user.isApproved = true;
    await user.save();
    res.json({ message: "Vendor approved successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Admin
// -----------------------------------------------
router.delete("/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/admin/products/:id/toggle
// @desc    Activate or deactivate a product listing
// @access  Admin
// -----------------------------------------------
router.put("/products/:id/toggle", adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = !product.isActive;
    await product.save();
    res.json({ message: `Product ${product.isActive ? "activated" : "deactivated"}`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/admin/orders
// @desc    Get all orders with optional status filter
// @access  Admin
// -----------------------------------------------
router.get("/orders", adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
