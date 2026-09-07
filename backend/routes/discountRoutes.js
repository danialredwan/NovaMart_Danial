const express = require("express");
const router = express.Router();
const Discount = require("../models/Discount");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/discounts/active
// @desc    Get all currently active & non-expired discounts (Feature 7)
//          Used on the frontend to display deals/promotions banner
// @access  Public
// -----------------------------------------------
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      expiresAt: { $gt: now }, // Only coupons that haven't expired yet
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/discounts/validate
// @desc    Validate a coupon code and return its value
//          Called when the customer types a code at checkout
// @access  Private — Customer
// -----------------------------------------------
router.post("/validate", protect, async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) return res.status(400).json({ message: "Please provide a coupon code" });

  try {
    const coupon = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    // Check if cart meets the minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum cart total of ৳${coupon.minOrderAmount} is required for this coupon`,
      });
    }

    // Calculate the discount amount to show the customer
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = ((cartTotal * coupon.value) / 100).toFixed(2);
    } else {
      discountAmount = Math.min(coupon.value, cartTotal).toFixed(2); // Can't discount more than total
    }

    res.json({
      message: "Coupon applied!",
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/discounts
// @desc    Get all coupons
// @access  Private — Admin only
// -----------------------------------------------
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/discounts
// @desc    Create a new coupon
// @access  Private — Admin only
// -----------------------------------------------
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  const { code, type, value, minOrderAmount, expiresAt } = req.body;

  try {
    const discount = await Discount.create({
      code: code.toUpperCase(), // Always store in uppercase
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      expiresAt,
    });
    res.status(201).json(discount);
  } catch (error) {
    // Handle duplicate coupon code error
    if (error.code === 11000) {
      return res.status(400).json({ message: "A coupon with this code already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/discounts/:id
// @desc    Update a coupon (e.g. deactivate it or change expiry)
// @access  Private — Admin only
// -----------------------------------------------
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!discount) return res.status(404).json({ message: "Coupon not found" });
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/discounts/:id
// @desc    Delete a coupon
// @access  Private — Admin only
// -----------------------------------------------
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
