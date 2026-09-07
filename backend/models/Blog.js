const mongoose = require("mongoose");

// Feature 15: Blog / Journal posts
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
