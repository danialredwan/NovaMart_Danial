const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { protect } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/blogs
// @desc    Get all blog posts (Feature 15)
// @access  Public
// -----------------------------------------------
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/blogs/:id
// @desc    Get a single blog post
// @access  Public
// -----------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name profilePicture");
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   POST /api/blogs
// @desc    Create a blog post (any logged-in user)
// @access  Private
// -----------------------------------------------
router.post("/", protect, async (req, res) => {
  const { title, content, image, tags } = req.body;
  try {
    const blog = await Blog.create({
      title,
      content,
      image,
      tags: tags || [],
      author: req.user._id,
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/blogs/:id
// @desc    Update a blog post
// @access  Private — Author or Admin
// -----------------------------------------------
router.put("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });

    const isAuthor = blog.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post
// @access  Private — Author or Admin
// -----------------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });

    const isAuthor = blog.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
