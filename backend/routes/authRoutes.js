const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Helper: generates a JWT token for a given user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -----------------------------------------------
// @route   POST /api/auth/register
// @desc    Register a new user (customer or vendor)
// @access  Public
// -----------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, role, storeName, storeDescription } = req.body;

  try {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create the new user (password gets hashed automatically in the model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
      storeName: storeName || "",
      storeDescription: storeDescription || "",
    });

    // Return user info + token so they are logged in immediately after registering
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/auth/login
// @desc    Login and get a JWT token
// @access  Public
// -----------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists AND the password is correct
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/auth/user/:id
// @desc    Get basic public info about a user by ID (used by chat)
// @access  Private
// -----------------------------------------------
router.get("/user/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id name role storeName profilePicture");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/auth/search?email=...
// @desc    Find a user by email (used for starting a chat)
// @access  Private (any logged-in user)
// -----------------------------------------------
router.get("/search", protect, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email }).select("_id name profilePicture role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/auth/profile
// @desc    Get logged-in user's profile
// @access  Private (requires JWT token)
// -----------------------------------------------
router.get("/profile", protect, async (req, res) => {
  // req.user is set by the protect middleware
  res.json(req.user);
});

// -----------------------------------------------
// @route   PUT /api/auth/profile
// @desc    Update logged-in user's profile
// @access  Private
// -----------------------------------------------
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Update only the fields that were sent in the request
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    // Vendor-specific updates
    if (user.role === "vendor") {
      user.storeName = req.body.storeName || user.storeName;
      user.storeDescription = req.body.storeDescription || user.storeDescription;
    }

    // Update password only if a new one is provided
    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
