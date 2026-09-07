const mongoose = require("mongoose");

// Feature 7: Discount coupons created by admin or vendors
const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Store codes in uppercase (e.g. SAVE20)
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"], // 20% off OR $10 off
      required: true,
    },
    value: {
      type: Number,
      required: true, // e.g. 20 for 20% or 10 for $10
    },
    minOrderAmount: {
      type: Number,
      default: 0, // Minimum cart total required to use this coupon
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
