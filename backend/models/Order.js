const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Unique human-readable order ID (fixes E11000 duplicate key error on orderId_1 index)
    orderId: {
      type: String,
      unique: true,
      sparse: true, // allows existing null docs; new docs always get a value via pre-save
    },

    // Who placed the order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Each item in the order (a single order can have products from multiple vendors)
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price at the time of purchase
      },
    ],

    totalPrice: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    loyaltyDiscount: { type: Number, default: 0 }, // 15% off for 500k+ points
    deliveryCharge: { type: Number, default: 0 },  // waived at 300k+ points
    finalPrice: { type: Number, required: true },

    // --- Feature 12: Payment ---
    paymentMethod: {
      type: String,
      enum: ["COD", "card", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // --- Feature 16: Delivery Options ---
    deliveryOption: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    shippingAddress: {
      type: String,
      default: "",
    },

    // --- Feature 10: Order Tracking ---
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate a unique orderId before saving new orders
// Using async (no next) — required for Mongoose 9.x
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderId) {
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.orderId = `ORD-${Date.now()}-${rand}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
