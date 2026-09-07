const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const VendorSubscription = require("../models/VendorSubscription");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const vendorOnly = [protect, authorizeRoles("vendor")];

// -----------------------------------------------
// @route   GET /api/vendor/analytics
// @desc    Sales analytics for the logged-in vendor (Feature 20)
//          Returns: total revenue, total orders, top products, monthly sales
// @access  Vendor
// -----------------------------------------------
router.get("/analytics", vendorOnly, async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get all non-cancelled orders that contain this vendor's products
    const orders = await Order.find({
      "items.vendor": vendorId,
      orderStatus: { $ne: "cancelled" },
    }).populate("items.product", "name");

    // Calculate total revenue and total items sold by this vendor
    let totalRevenue = 0;
    let totalOrders = 0;
    const productSalesMap = {}; // Track sales per product

    orders.forEach((order) => {
      // Only count items belonging to this vendor in each order
      const myItems = order.items.filter(
        (item) => item.vendor.toString() === vendorId.toString()
      );

      if (myItems.length > 0) totalOrders++;

      myItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;

        // Build sales map for top products report
        const productName = item.product?.name || "Unknown";
        if (!productSalesMap[productName]) {
          productSalesMap[productName] = { sales: 0, revenue: 0 };
        }
        productSalesMap[productName].sales += item.quantity;
        productSalesMap[productName].revenue += item.price * item.quantity;
      });
    });

    // Sort products by revenue to find top performers
    const topProducts = Object.entries(productSalesMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5

    // Monthly sales breakdown (last 6 months)
    const monthlySales = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short", year: "numeric",
      });
      const myRevenue = order.items
        .filter((i) => i.vendor.toString() === vendorId.toString())
        .reduce((sum, i) => sum + i.price * i.quantity, 0);

      monthlySales[month] = (monthlySales[month] || 0) + myRevenue;
    });

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      totalProducts: await Product.countDocuments({ vendor: vendorId }),
      topProducts,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/vendor/subscription
// @desc    Get current vendor's active subscription (Feature 21)
// @access  Vendor
// -----------------------------------------------
router.get("/subscription", vendorOnly, async (req, res) => {
  try {
    const subscription = await VendorSubscription.findOne({
      vendor: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() }, // Not expired
    });

    res.json(subscription || { plan: "none", message: "No active subscription" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/vendor/subscription
// @desc    Buy a vendor membership plan (Feature 21)
// @access  Vendor
// -----------------------------------------------
router.post("/subscription", vendorOnly, async (req, res) => {
  const { plan } = req.body;

  // Define plan pricing and duration
  const plans = {
    basic:   { price: 9.99,  durationDays: 30 },
    premium: { price: 29.99, durationDays: 30 },
  };

  if (!plans[plan]) {
    return res.status(400).json({ message: "Invalid plan. Choose 'basic' or 'premium'" });
  }

  try {
    // Deactivate any existing subscription first
    await VendorSubscription.updateMany(
      { vendor: req.user._id },
      { isActive: false }
    );

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plans[plan].durationDays);

    const subscription = await VendorSubscription.create({
      vendor: req.user._id,
      plan,
      price: plans[plan].price,
      endDate,
    });

    res.status(201).json({ message: `${plan} plan activated!`, subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
