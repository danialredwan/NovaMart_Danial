const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   GET /api/chat/:userId
// @desc    Get chat history between the logged-in user and another user (Feature 14)
// @access  Private
// -----------------------------------------------
router.get("/:userId", protect, async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    // Get all messages where either: I sent to them, OR they sent to me
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 }); // Oldest first (like a real chat)

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/chat/conversations/list
// @desc    Get a list of all users this person has chatted with
// @access  Private
// -----------------------------------------------
router.get("/conversations/list", protect, async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages involving this user and get unique conversation partners
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .populate("sender", "name profilePicture")
      .populate("receiver", "name profilePicture")
      .sort({ createdAt: -1 });

    // Build a map of unique conversation partners (latest message per person)
    const conversationMap = {};
    messages.forEach((msg) => {
      const other =
        msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;
      const otherId = other._id.toString();
      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          user: other,
          lastMessage: msg.message,
          lastTime: msg.createdAt,
          unread:
            msg.receiver._id.toString() === myId.toString() && !msg.isRead ? 1 : 0,
        };
      }
    });

    res.json(Object.values(conversationMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
