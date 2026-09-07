const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const { protect } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/wishlist
// @desc    Get the logged-in user's wishlist
// @access  Private
// -----------------------------------------------
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name price discountedPrice images stockStatus averageRating"
    );

    if (!wishlist) {
      return res.json({ products: [] }); // Return empty if no wishlist yet
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/wishlist/:productId
// @desc    Add a product to wishlist
// @access  Private
// -----------------------------------------------
router.post("/:productId", protect, async (req, res) => {
  try {
    // Find or create a wishlist for this user
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Only add if not already in the wishlist (avoid duplicates)
    const alreadyAdded = wishlist.products.includes(req.params.productId);
    if (alreadyAdded) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push(req.params.productId);
    await wishlist.save();
    res.json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/wishlist/:productId
// @desc    Remove a product from wishlist
// @access  Private
// -----------------------------------------------
router.delete("/:productId", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    // Remove the product ID from the array
    wishlist.products = wishlist.products.filter(
      (productId) => productId.toString() !== req.params.productId
    );

    await wishlist.save();
    res.json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
