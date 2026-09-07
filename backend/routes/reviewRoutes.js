const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// Helper: Recalculate and save a product's average rating
// Called every time a review is added or deleted
// -----------------------------------------------
const recalculateRating = async (productId) => {
  // Get all reviews for this product
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    // No reviews left — reset rating to 0
    await Product.findByIdAndUpdate(productId, { averageRating: 0, totalReviews: 0 });
    return;
  }

  // Sum all ratings and divide by count to get average
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = (totalRating / reviews.length).toFixed(1); // e.g. 4.3

  await Product.findByIdAndUpdate(productId, {
    averageRating: average,
    totalReviews: reviews.length,
  });
};

// -----------------------------------------------
// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
// @access  Public
// -----------------------------------------------
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name profilePicture") // Show reviewer's name and photo
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/reviews/:productId
// @desc    Write a review for a product (Feature 3)
// @access  Private — Customer only, must have purchased the product
// -----------------------------------------------
router.post("/:productId", protect, authorizeRoles("customer"), async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  try {
    // Check if the customer has actually purchased this product
    // We look for a delivered order that contains this product
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      "items.product": productId,
      orderStatus: "delivered",
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can only review products you have purchased and received.",
      });
    }

    // Check if this user already reviewed this product (model has unique index)
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    // Create the review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });

    // Update the product's average rating immediately
    await recalculateRating(productId);

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private — The reviewer themselves or an admin
// -----------------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only the person who wrote it or an admin can delete it
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product; // Save before deleting
    await review.deleteOne();

    // Recalculate average rating after deletion
    await recalculateRating(productId);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
