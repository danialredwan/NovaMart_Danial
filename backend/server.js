const express = require("express");
const http = require("http");       // Needed to attach Socket.io to Express
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();

// Create an HTTP server from our Express app so Socket.io can share the same port
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
// cors here allows our React frontend (port 3000) to connect
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
  },
});

// --- Multer: Local image upload storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- REST API Routes ---
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/cart",       require("./routes/cartRoutes"));
app.use("/api/wishlist",   require("./routes/wishlistRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));
app.use("/api/reviews",    require("./routes/reviewRoutes"));
app.use("/api/discounts",  require("./routes/discountRoutes"));
app.use("/api/refunds",    require("./routes/refundRoutes"));
app.use("/api/blogs",      require("./routes/blogRoutes"));
app.use("/api/chat",       require("./routes/chatRoutes"));
app.use("/api/admin",      require("./routes/adminRoutes"));
app.use("/api/vendor",     require("./routes/vendorRoutes"));

// --- Image Upload Endpoint ---
// POST /api/upload  →  returns { url: "/uploads/<filename>" }
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get("/", (req, res) => res.send("NovaMart API is running..."));

// --- Socket.io: Real-Time Chat (Feature 14) ---
// Each user joins a "room" named after their own user ID
// When they send a message, we emit it to the receiver's room
io.on("connection", (socket) => {
  // When a user opens the chat, they join their personal room
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  // When a message is sent, save it to DB and push to receiver in real time
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        message,
      });

      // Populate sender info before emitting so the frontend can show name/photo
      const populated = await newMessage.populate("sender", "name profilePicture");

      // Emit to receiver's room so they see it instantly
      io.to(receiverId).emit("receiveMessage", populated);
      // Also emit back to sender so their own message appears in the chat
      io.to(senderId).emit("receiveMessage", populated);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
