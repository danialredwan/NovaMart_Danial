const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Discounted price — if no discount, same as price
    discountedPrice: {
      type: Number,
      default: null,
    },
    images: [String], // Array of image URLs

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // The vendor who listed this product
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Feature 18: Detailed Product Info ---
    brand: { type: String, default: "" },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    material: { type: String, default: "" },
    specifications: { type: String, default: "" },

    // --- Feature 6: Stock Status ---
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    stockStatus: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },

    // --- Feature 4: Tags help the recommendation system ---
    tags: [String],

    // Average rating is updated whenever a new review is added
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true, // Admin can deactivate a product
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
