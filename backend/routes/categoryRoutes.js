const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
// -----------------------------------------------
router.get("/", async (req, res) => {
  try {
    // populate("parentCategory") fills in the parent category's name instead of just its ID
    const categories = await Category.find().populate("parentCategory", "name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/categories/:id
// @desc    Get a single category by ID
// @access  Public
// -----------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("parentCategory", "name");
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/categories
// @desc    Create a new category
// @access  Private — Admin only
// -----------------------------------------------
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  const { name, description, image, parentCategory } = req.body;

  try {
    const category = await Category.create({
      name,
      description,
      image,
      parentCategory: parentCategory || null,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private — Admin only
// -----------------------------------------------
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private — Admin only
// -----------------------------------------------
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
