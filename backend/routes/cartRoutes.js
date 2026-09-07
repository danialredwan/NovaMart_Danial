const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require the user to be logged in
// -----------------------------------------------
// @route   GET /api/cart
// @desc    Get the logged-in user's cart
// @access  Private
// -----------------------------------------------
router.get("/", protect, async (req, res) => {
  try {
    // Find this user's cart and fill in full product details
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price discountedPrice images stockStatus stock"
    );

    if (!cart) {
      // Return an empty cart structure if no cart exists yet
      return res.json({ items: [], totalPrice: 0 });
    }

    // Calculate total price (use discountedPrice if available)
    let totalPrice = 0;
    cart.items.forEach((item) => {
      const price = item.product.discountedPrice || item.product.price;
      totalPrice += price * item.quantity;
    });

    res.json({ items: cart.items, totalPrice: totalPrice.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/cart
// @desc    Add a product to cart (or increase qty if already there)
// @access  Private
// -----------------------------------------------
router.post("/", protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = quantity || 1;

  try {
    // Make sure the product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stockStatus === "out-of-stock") {
      return res.status(400).json({ message: "This product is out of stock" });
    }

    // Find this user's cart, or create a new one if it doesn't exist
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if this product is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists in cart — just increase the quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // New product — push it to the items array
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/cart/:productId
// @desc    Update quantity of a specific item in cart
// @access  Private
// -----------------------------------------------
router.put("/:productId", protect, async (req, res) => {
  const { quantity } = req.body;

  // Quantity must be at least 1
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/cart/:productId
// @desc    Remove a specific item from cart
// @access  Private
// -----------------------------------------------
router.delete("/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the item with the matching product ID
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/cart
// @desc    Clear the entire cart (called after checkout)
// @access  Private
// -----------------------------------------------
router.delete("/", protect, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
