const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/products
// @desc    Get all products — supports search & filter (Feature 1)
// @access  Public
//
// Query params supported:
//   ?search=phone          → search by name/description
//   ?category=<id>         → filter by category
//   ?brand=Samsung         → filter by brand
//   ?color=red             → filter by color
//   ?minPrice=100          → minimum price
//   ?maxPrice=500          → maximum price
//   ?stockStatus=in-stock  → filter by stock status
//   ?sort=price_asc        → sort results
// -----------------------------------------------
router.get("/", async (req, res) => {
  try {
    // Build a filter object from query params
    const filter = { isActive: true };

    // Feature 1: Search by name or description (case-insensitive)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by brand
    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: "i" };
    }

    // Filter by color
    if (req.query.color) {
      filter.color = { $regex: req.query.color, $options: "i" };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Feature 6: Filter by stock status
    if (req.query.stockStatus) {
      filter.stockStatus = req.query.stockStatus;
    }

    // Sorting logic
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === "price_asc") sortOption = { price: 1 };
    if (req.query.sort === "price_desc") sortOption = { price: -1 };
    if (req.query.sort === "rating") sortOption = { averageRating: -1 };

    const products = await Product.find(filter)
      .populate("category", "name")   // Show category name, not just ID
      .populate("vendor", "name storeName") // Show vendor info
      .sort(sortOption);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/products/shop/:vendorId
// @desc    Get all products by a specific vendor (public vendor shop page)
// @access  Public
// -----------------------------------------------
router.get("/shop/:vendorId", async (req, res) => {
  try {
    const User = require("../models/User");
    const vendor = await User.findById(req.params.vendorId).select("name storeName storeDescription profilePicture");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const products = await Product.find({ vendor: req.params.vendorId, isActive: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ vendor, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/products/vendor/myproducts
// @desc    Get all products listed by the logged-in vendor
// @access  Private — Vendor only
// -----------------------------------------------
router.get("/vendor/myproducts", protect, authorizeRoles("vendor"), async (req, res) => {
  try {
    // req.user._id is the logged-in vendor's ID
    const products = await Product.find({ vendor: req.user._id })
      .populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
// -----------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("vendor", "name storeName storeDescription");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/products
// @desc    Create a new product
// @access  Private — Vendor only (must be approved by admin)
// -----------------------------------------------
router.post("/", protect, authorizeRoles("vendor"), async (req, res) => {
  // Only approved vendors can list products
  if (!req.user.isApproved) {
    return res.status(403).json({ message: "Your vendor account is pending admin approval." });
  }

  const {
    name, description, price, discountedPrice, images,
    category, brand, color, size, material, specifications,
    stock, tags,
  } = req.body;

  try {
    // Automatically set stockStatus based on quantity
    let stockStatus = "in-stock";
    if (stock === 0) stockStatus = "out-of-stock";
    else if (stock <= 5) stockStatus = "low-stock";

    const product = await Product.create({
      name, description, price, discountedPrice, images,
      category,
      vendor: req.user._id, // Automatically set to logged-in vendor
      brand, color, size, material, specifications,
      stock, stockStatus, tags,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private — Only the vendor who owns it (or admin)
// -----------------------------------------------
router.put("/:id", protect, authorizeRoles("vendor", "admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Vendors can only edit their own products; admins can edit any
    if (req.user.role === "vendor" && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    // Recalculate stockStatus if stock quantity is being updated
    if (req.body.stock !== undefined) {
      if (req.body.stock === 0) req.body.stockStatus = "out-of-stock";
      else if (req.body.stock <= 5) req.body.stockStatus = "low-stock";
      else req.body.stockStatus = "in-stock";
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private — Vendor (own products) or Admin
// -----------------------------------------------
router.delete("/:id", protect, authorizeRoles("vendor", "admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.role === "vendor" && product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
