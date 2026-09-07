const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Discount = require("../models/Discount");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// Helper: Update loyalty points and badge after a purchase (Feature 17)
// Rule: 1 loyalty point earned per 1 BDT spent
// Badge levels: bronze (0–299,999) | silver (300,000–499,999) | gold (500,000+)
// Rewards: silver = free delivery | gold = free delivery + 15% off
// -----------------------------------------------
const updateLoyalty = async (userId, amountSpent) => {
  const user = await User.findById(userId);
  user.loyaltyPoints += Math.floor(amountSpent);

  // Badge only upgrades — never downgrades once earned
  if (user.loyaltyPoints >= 500000) user.loyaltyBadge = "gold";
  else if (user.loyaltyPoints >= 300000 && user.loyaltyBadge !== "gold") user.loyaltyBadge = "silver";
  // bronze stays if neither threshold hit yet

  await user.save();
};

// -----------------------------------------------
// @route   POST /api/orders
// @desc    Place a new order (checkout)
// @access  Private — Customer only
//
// Flow: validate coupon → build order from cart →
//       deduct stock → clear cart → award loyalty points
// -----------------------------------------------
router.post("/", protect, authorizeRoles("customer"), async (req, res) => {
  const { paymentMethod, deliveryOption, shippingAddress, couponCode } = req.body;

  try {
    // Step 1: Get the user's current cart with full product details
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Step 2: Build the order items array and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      // Double-check stock is still available at time of checkout
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      const unitPrice = product.discountedPrice || product.price;
      totalPrice += unitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    // Step 3: Apply coupon discount if provided (Feature 7)
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Discount.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() }, // Coupon must not be expired
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon code" });
      }

      if (totalPrice < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
        });
      }

      // Calculate discount value
      if (coupon.type === "percentage") {
        couponDiscount = (totalPrice * coupon.value) / 100;
      } else {
        couponDiscount = coupon.value;
      }
    }

    // Step 3b: Apply loyalty rewards based on the customer's earned badge
    // Badge is a permanent milestone — once silver/gold, always silver/gold
    const customer = await User.findById(req.user._id);
    const badge = customer.loyaltyBadge || "bronze";

    // silver or gold → free delivery; gold → extra 15% off
    const freeDelivery = badge === "silver" || badge === "gold";
    const loyaltyDiscountPct = badge === "gold" ? 0.15 : 0;

    const deliveryCharge = (deliveryOption === "delivery" && !freeDelivery) ? 100 : 0;
    const priceAfterCoupon = Math.max(0, totalPrice - couponDiscount);
    const loyaltyDiscount = parseFloat((priceAfterCoupon * loyaltyDiscountPct).toFixed(2));
    const finalPrice = Math.max(0, priceAfterCoupon - loyaltyDiscount + deliveryCharge);

    // Step 4: Create the order in the database
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalPrice: totalPrice.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2),
      loyaltyDiscount,
      deliveryCharge,
      finalPrice: finalPrice.toFixed(2),
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      deliveryOption: deliveryOption || "delivery",
      shippingAddress: shippingAddress || "",
    });

    // Step 5: Reduce stock for each product that was ordered
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;

      // Automatically update stock status label
      if (product.stock === 0) product.stockStatus = "out-of-stock";
      else if (product.stock <= 5) product.stockStatus = "low-stock";
      else product.stockStatus = "in-stock";

      await product.save();
    }

    // Step 6: Clear the cart after successful order
    await Cart.findOneAndDelete({ user: req.user._id });

    // Step 7: Award loyalty points to the customer (Feature 17)
    await updateLoyalty(req.user._id, finalPrice);

    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/orders/myorders
// @desc    Get all orders placed by the logged-in customer (Feature 19)
// @access  Private — Customer only
// -----------------------------------------------
router.get("/myorders", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 }); // Newest orders first

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/orders/vendor/orders
// @desc    Get all orders that contain the logged-in vendor's products
// @access  Private — Vendor only
// -----------------------------------------------
router.get("/vendor/orders", protect, authorizeRoles("vendor"), async (req, res) => {
  try {
    // Find orders where at least one item belongs to this vendor
    const orders = await Order.find({ "items.vendor": req.user._id })
      .populate("customer", "name email")
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 });

    // Filter each order's items to show only this vendor's products
    const vendorOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.vendor.toString() === req.user._id.toString()
      );
      return { ...order._doc, items: myItems };
    });

    res.json(vendorOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/orders
// @desc    Get ALL orders on the platform
// @access  Private — Admin only
// -----------------------------------------------
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/orders/:id
// @desc    Get a single order by ID
// @access  Private — The customer who placed it, the vendor, or admin
// -----------------------------------------------
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("items.product", "name images price")
      .populate("items.vendor", "name storeName");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Access control: only allow customer, a relevant vendor, or admin
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isVendor = order.items.some(
      (item) => item.vendor._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order (Feature 19)
// @access  Private — Customer only (only if still "pending")
// -----------------------------------------------
router.put("/:id/cancel", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only the customer who placed it can cancel it
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Can only cancel if order hasn't been shipped yet
    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled — it is already "${order.orderStatus}"`,
      });
    }

    // Restore stock for each item when order is cancelled
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        if (product.stock > 5) product.stockStatus = "in-stock";
        else if (product.stock > 0) product.stockStatus = "low-stock";
        await product.save();
      }
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/orders/:id/status
// @desc    Update order status + tracking note (Feature 10)
// @access  Private — Admin or Vendor
// -----------------------------------------------
router.put("/:id/status", protect, authorizeRoles("admin", "vendor"), async (req, res) => {
  const { orderStatus, trackingNote } = req.body;

  // Allowed status values in the correct progression
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ message: "Invalid order status value" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    if (trackingNote) order.trackingNote = trackingNote;

    // Mark payment as paid when order is delivered (for COD orders)
    if (orderStatus === "delivered" && order.paymentMethod === "COD") {
      order.paymentStatus = "paid";
    }

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
