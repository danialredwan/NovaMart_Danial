const express = require("express");
const router = express.Router();
const RefundRequest = require("../models/RefundRequest");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// -----------------------------------------------
// @route   POST /api/refunds
// @desc    Submit a return/refund request (Feature 11)
// @access  Private — Customer only
// -----------------------------------------------
router.post("/", protect, authorizeRoles("customer"), async (req, res) => {
  const { orderId, reason } = req.body;

  try {
    // Verify the order exists and belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your order" });
    }

    // Can only request refund for delivered orders
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        message: "Refunds can only be requested for delivered orders",
      });
    }

    // Prevent submitting duplicate refund request for same order
    const existingRequest = await RefundRequest.findOne({
      order: orderId,
      customer: req.user._id,
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "You have already submitted a refund request for this order",
      });
    }

    const refundRequest = await RefundRequest.create({
      order: orderId,
      customer: req.user._id,
      reason,
    });

    res.status(201).json({ message: "Refund request submitted", refundRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/refunds/myrefunds
// @desc    Get the logged-in customer's refund requests
// @access  Private — Customer only
// -----------------------------------------------
router.get("/myrefunds", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const refunds = await RefundRequest.find({ customer: req.user._id })
      .populate("order", "finalPrice orderStatus createdAt") // Show order summary
      .sort({ createdAt: -1 });

    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   GET /api/refunds
// @desc    Get ALL refund requests
// @access  Private — Admin only
// -----------------------------------------------
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    // Optional: filter by status using ?status=pending
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const refunds = await RefundRequest.find(filter)
      .populate("customer", "name email")
      .populate("order", "finalPrice orderStatus")
      .sort({ createdAt: -1 });

    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------------------
// @route   PUT /api/refunds/:id
// @desc    Approve or reject a refund request (Feature 11)
// @access  Private — Admin only
// -----------------------------------------------
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
  }

  try {
    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) return res.status(404).json({ message: "Refund request not found" });

    // Can't change a decision that's already been made
    if (refund.status !== "pending") {
      return res.status(400).json({
        message: `This request has already been ${refund.status}`,
      });
    }

    refund.status = status;
    await refund.save();

    // If approved, mark the original order as cancelled
    if (status === "approved") {
      await Order.findByIdAndUpdate(refund.order, { orderStatus: "cancelled" });
    }

    res.json({ message: `Refund request ${status}`, refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
