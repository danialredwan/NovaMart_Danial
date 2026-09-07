const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
const outputPath = path.join(__dirname, "NovaMart_Guide.pdf");
doc.pipe(fs.createWriteStream(outputPath));

// ─── Colour palette ───────────────────────────────────────────────────────────
const BLUE   = "#1976d2";
const DARK   = "#1a1a2e";
const GRAY   = "#555555";
const LIGHT  = "#f5f5f5";
const GREEN  = "#2e7d32";
const RED    = "#c62828";
const WHITE  = "#ffffff";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pageW  = doc.page.width;
const margin = 50;
const inner  = pageW - margin * 2;

function sectionTitle(text) {
  doc.moveDown(0.6)
     .fontSize(13).fillColor(BLUE).font("Helvetica-Bold")
     .text(text)
     .moveDown(0.3);
  doc.moveTo(margin, doc.y).lineTo(pageW - margin, doc.y)
     .strokeColor(BLUE).lineWidth(1).stroke();
  doc.moveDown(0.4);
}

function h1(text) {
  doc.fontSize(11).fillColor(DARK).font("Helvetica-Bold").text(text);
  doc.moveDown(0.25);
}

function body(text) {
  doc.fontSize(10).fillColor(GRAY).font("Helvetica").text(text, { lineGap: 3 });
  doc.moveDown(0.2);
}

function bullet(text, indent = 10) {
  const x = margin + indent;
  doc.fontSize(10).fillColor(GRAY).font("Helvetica")
     .text(`• ${text}`, x, doc.y, { width: inner - indent, lineGap: 3 });
  doc.moveDown(0.15);
}

function codeBlock(lines) {
  const blockH = lines.length * 14 + 14;
  doc.rect(margin, doc.y, inner, blockH).fill("#f0f4ff");
  const startY = doc.y + 7;
  lines.forEach((line, i) => {
    doc.fontSize(9).fillColor(DARK).font("Courier")
       .text(line, margin + 10, startY + i * 14, { lineBreak: false });
  });
  doc.y = startY + lines.length * 14 + 4;
  doc.moveDown(0.4);
}

function tableRow(cols, widths, isHeader = false) {
  const rowH   = 18;
  const startX = margin;
  const startY = doc.y;
  const bg     = isHeader ? BLUE : null;
  const color  = isHeader ? WHITE : DARK;
  const font   = isHeader ? "Helvetica-Bold" : "Helvetica";

  if (bg) doc.rect(startX, startY, inner, rowH).fill(bg);
  else     doc.rect(startX, startY, inner, rowH).fillColor(i => i % 2 === 0 ? LIGHT : WHITE);

  let x = startX + 6;
  cols.forEach((col, i) => {
    doc.fontSize(9).fillColor(color).font(font)
       .text(col, x, startY + 4, { width: widths[i] - 8, lineBreak: false });
    x += widths[i];
  });
  doc.y = startY + rowH;
}

function altTableRow(cols, widths, rowIndex) {
  const rowH   = 18;
  const startX = margin;
  const startY = doc.y;
  const bg     = rowIndex % 2 === 0 ? "#f9f9f9" : WHITE;
  doc.rect(startX, startY, inner, rowH).fill(bg);
  let x = startX + 6;
  cols.forEach((col, i) => {
    doc.fontSize(9).fillColor(DARK).font("Helvetica")
       .text(col, x, startY + 4, { width: widths[i] - 8, lineBreak: false });
    x += widths[i];
  });
  doc.y = startY + rowH;
  doc.moveDown(0);
}

function drawTableBorder(startY, rows, colCount) {
  doc.rect(margin, startY, inner, (rows + 1) * 18).stroke("#dddddd");
}

// ══════════════════════════════════════════════════════════════════════════════
//  COVER PAGE
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, pageW, doc.page.height).fill(BLUE);

doc.fontSize(32).fillColor(WHITE).font("Helvetica-Bold")
   .text("NovaMart", margin, 180, { align: "center" });

doc.fontSize(16).fillColor("#e3f2fd").font("Helvetica")
   .text("Multi-Vendor E-Commerce Platform", margin, 225, { align: "center" });

doc.fontSize(12).fillColor("#bbdefb").font("Helvetica")
   .text("Developer Guide", margin, 260, { align: "center" });

doc.moveTo(margin + 60, 295).lineTo(pageW - margin - 60, 295)
   .strokeColor("#90caf9").lineWidth(1).stroke();

doc.fontSize(11).fillColor(WHITE).font("Helvetica-Bold")
   .text("Contents", margin, 320, { align: "center" });

const contents = [
  "Part 1 — How to Start, Access & Maintain the Project",
  "Part 2 — Complete File & Folder Structure (61 Files)",
];
contents.forEach((c, i) => {
  doc.fontSize(10).fillColor("#e3f2fd").font("Helvetica")
     .text(`${i + 1}.  ${c}`, margin, 350 + i * 22, { align: "center" });
});

doc.fontSize(9).fillColor("#90caf9")
   .text("Built with MERN Stack  ·  MongoDB · Express · React · Node.js", margin, doc.page.height - 60, { align: "center" });

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE 2+ — PART 1
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();

// Page header
doc.rect(0, 0, pageW, 46).fill(BLUE);
doc.fontSize(16).fillColor(WHITE).font("Helvetica-Bold")
   .text("Part 1 — How to Start, Access & Maintain NovaMart", margin, 14);

doc.y = 66;

// ── INTRO ────────────────────────────────────────────────────────────────────
body("This guide explains how to run the NovaMart project on your computer, how to access the website in a browser, how to shut it down, and how to perform basic maintenance tasks.");

// ── REQUIREMENT ──────────────────────────────────────────────────────────────
sectionTitle("What You Need Before Starting");
bullet("Node.js installed (already done — your backend works)");
bullet("MongoDB installed and running as a Windows Service (already confirmed running)");
bullet("The NovaMart project folder at:  d:\\Latest  NovaMart\\");
bullet("VS Code (or any terminal)");

// ── STARTING ─────────────────────────────────────────────────────────────────
sectionTitle("Starting the Project — Two Terminals Required");
body("You must keep TWO terminals open at the same time. One runs the backend (API server), the other runs the frontend (React website). Both must be running for the site to work.");

h1("Terminal 1 — Backend (API Server)");
body("Open VS Code, press Ctrl + ` to open a terminal, then type:");
codeBlock(["cd backend", "npm run dev"]);
body("You should see:");
codeBlock(["Server running on port 5000", "MongoDB Connected: localhost"]);
body("Leave this terminal open. Do NOT close it.");

doc.moveDown(0.3);
h1("Terminal 2 — Frontend (React Website)");
body("Click the + button in the VS Code terminal bar to open a second terminal, then type:");
codeBlock(["cd frontend", "npm run dev"]);
body("You should see:");
codeBlock(["  VITE v8.x.x  ready in 300ms", "  ➜  Local:   http://localhost:5173/"]);
body("Leave this terminal open. Do NOT close it.");

// ── ACCESS ───────────────────────────────────────────────────────────────────
sectionTitle("Accessing the Website");
body("Once both terminals are running, open your browser and go to:");
codeBlock(["http://localhost:5173"]);
body("The NovaMart website will load. You can use all features from this address.");

// ── ACCOUNTS ─────────────────────────────────────────────────────────────────
sectionTitle("Ready-to-Use Login Accounts (Already in Database)");
const acW = [inner / 3, inner / 3, inner / 3];
const tableStartY = doc.y;
tableRow(["Role", "Email", "Password"], acW, true);
[
  ["Admin",    "admin@novamart.com",    "admin123"],
  ["Vendor",   "vendor@novamart.com",   "vendor123"],
  ["Customer", "customer@novamart.com", "customer123"],
].forEach((row, i) => altTableRow(row, acW, i));
doc.moveDown(0.5);

// ── CLOSING ──────────────────────────────────────────────────────────────────
sectionTitle("Closing the Project");
body("When you are done and want to stop the website, do this in each terminal:");
bullet("Click on Terminal 1 (backend) → Press Ctrl + C");
bullet("Click on Terminal 2 (frontend) → Press Ctrl + C");
bullet("You can now close VS Code safely.");
body("MongoDB continues running as a Windows background service automatically. You do not need to manage it.");

// ── REOPEN ───────────────────────────────────────────────────────────────────
sectionTitle("Reopening the Project (Next Day or Any Time)");
body("Every time you want to work on NovaMart again, run the same two commands:");
codeBlock(["Terminal 1:   cd backend   →  npm run dev", "Terminal 2:   cd frontend  →  npm run dev"]);
body("All your data (users, products, orders) will still be there because MongoDB saves it permanently on your computer.");

// ── ADD PAGE for Problems ─────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, pageW, 46).fill(BLUE);
doc.fontSize(16).fillColor(WHITE).font("Helvetica-Bold")
   .text("Part 1 (continued) — Common Problems & Maintenance", margin, 14);
doc.y = 66;

// ── PROBLEMS ─────────────────────────────────────────────────────────────────
sectionTitle("Common Problems & How to Fix Them");

h1('Problem 1: "Port 5000 is already in use"');
body("This happens when the backend was not closed properly last time. A previous node process is still holding the port. Fix:");
bullet("Open PowerShell (search it in the Start Menu)");
bullet("Paste and run this command:");
codeBlock([
  "Get-NetTCPConnection -LocalPort 5000 |",
  "  Select-Object OwningProcess |",
  "  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }",
]);
bullet("Then run  npm run dev  again in the backend terminal.");

doc.moveDown(0.3);
h1('Problem 2: "MongoDB not connected"');
body("MongoDB might have stopped. To restart it:");
bullet("Press the Windows key and search for  Services");
bullet("Find  MongoDB  in the list");
bullet("Right-click → Start");
bullet("Then run the backend again.");

doc.moveDown(0.3);
h1('Problem 3: Frontend shows "Network Error"');
body("The backend is not running. Start the backend first (Terminal 1), then refresh the browser.");

doc.moveDown(0.3);
h1('Problem 4: "npm not found" in terminal');
body("Node.js may not be in your PATH. Fix:");
bullet("Close VS Code and reopen it");
bullet("Or reinstall Node.js from  https://nodejs.org  and restart your computer");

// ── MAINTENANCE ──────────────────────────────────────────────────────────────
sectionTitle("Basic Maintenance Tasks");

h1("Add a New Category (as Admin)");
bullet("Login with admin@novamart.com");
bullet("Go to:  http://localhost:5173/admin/categories");
bullet("Fill in the name, description, image URL → click Add Category");

doc.moveDown(0.2);
h1("Add a New Product (as Vendor)");
bullet("Login with vendor@novamart.com");
bullet("Go to:  http://localhost:5173/vendor/products");
bullet("Click + Add Product, fill all fields → submit");

doc.moveDown(0.2);
h1("Approve a New Vendor (as Admin)");
bullet("Login with admin@novamart.com");
bullet("Go to:  http://localhost:5173/admin/users");
bullet("Click Vendor filter tab → find pending vendor → click Approve");

doc.moveDown(0.2);
h1("View Sales Reports (as Vendor)");
bullet("Login with vendor@novamart.com");
bullet("Go to:  http://localhost:5173/vendor/analytics");
bullet("See total revenue, top products, monthly bar chart");

doc.moveDown(0.2);
h1("Approve / Reject a Refund (as Admin)");
bullet("Login with admin@novamart.com");
bullet("Go to:  http://localhost:5173/admin/refunds");
bullet("Click Approve or Reject on any pending request");

doc.moveDown(0.2);
h1("Create a Discount Coupon (as Admin)");
bullet("Login with admin@novamart.com");
bullet("Go to:  http://localhost:5173/admin/discounts");
bullet("Fill in Code, Type (% or fixed), Value, Expiry → click Create Coupon");
bullet("Example: Code = SAVE10, Type = percentage, Value = 10");

// ── QUICK REF ─────────────────────────────────────────────────────────────────
sectionTitle("Quick Reference Card");
codeBlock([
  "START PROJECT",
  "──────────────────────────────────────────────────",
  "Terminal 1:  cd backend   →  npm run dev",
  "Terminal 2:  cd frontend  →  npm run dev",
  "Browser:     http://localhost:5173",
  "",
  "STOP PROJECT",
  "──────────────────────────────────────────────────",
  "In each terminal: press  Ctrl + C",
  "",
  "PORTS USED",
  "──────────────────────────────────────────────────",
  "Backend API :  http://localhost:5000",
  "Frontend    :  http://localhost:5173",
  "Database    :  mongodb://localhost:27017/novamart",
]);

// ══════════════════════════════════════════════════════════════════════════════
//  PART 2 — FILE STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
doc.rect(0, 0, pageW, 46).fill(BLUE);
doc.fontSize(16).fillColor(WHITE).font("Helvetica-Bold")
   .text("Part 2 — Complete File & Folder Structure", margin, 14);
doc.y = 66;

body("NovaMart contains 61 hand-written source files split between the backend (Node.js/Express) and frontend (React/Vite). Below is every file, its location, and what it does.");

// ── BACKEND ──────────────────────────────────────────────────────────────────
sectionTitle("Backend  (d:\\Latest  NovaMart\\backend\\)");

h1("Root Files");
const rfW = [200, inner - 200];
tableRow(["File", "Purpose"], rfW, true);
[
  ["server.js",       "ENTRY POINT — starts Express, Socket.io, all routes"],
  [".env",            "Secret config: MONGO_URI, JWT_SECRET, PORT"],
  ["package.json",    "Lists all npm packages the backend needs"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("config/");
tableRow(["File", "Purpose"], rfW, true);
altTableRow(["db.js", "Connects the app to MongoDB using the URI in .env"], rfW, 0);
doc.moveDown(0.5);

h1("middleware/");
tableRow(["File", "Purpose"], rfW, true);
altTableRow(["authMiddleware.js", "protect() — checks JWT token | authorizeRoles() — checks role"], rfW, 0);
doc.moveDown(0.5);

h1("models/  (12 files — each is one MongoDB collection)");
tableRow(["File", "Collection / Purpose"], rfW, true);
[
  ["User.js",               "Customers, Vendors & Admins with loyalty points"],
  ["Product.js",            "Products with stock, specs, pricing, tags"],
  ["Category.js",           "Product categories (supports sub-categories)"],
  ["Order.js",              "Orders with items, payment method, tracking status"],
  ["Cart.js",               "One shopping cart per user"],
  ["Wishlist.js",           "Saved/favourite product list per user"],
  ["Review.js",             "Star ratings and comments for products"],
  ["Discount.js",           "Coupon codes (percentage or fixed value)"],
  ["Message.js",            "Real-time chat messages between users"],
  ["Blog.js",               "Blog posts written by any logged-in user"],
  ["RefundRequest.js",      "Return & refund requests submitted by customers"],
  ["VendorSubscription.js", "Vendor membership plans (basic / premium)"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

// ── routes ──────────────────────────────────────────────────────────────────
h1("routes/  (13 files — each handles one group of API endpoints)");
tableRow(["File", "API Path  →  What it handles"], rfW, true);
[
  ["authRoutes.js",     "/api/auth       →  register, login, profile"],
  ["productRoutes.js",  "/api/products   →  search, filter, CRUD, vendor products"],
  ["categoryRoutes.js", "/api/categories →  CRUD for categories"],
  ["cartRoutes.js",     "/api/cart       →  add, update quantity, remove, clear"],
  ["wishlistRoutes.js", "/api/wishlist   →  add and remove from wishlist"],
  ["orderRoutes.js",    "/api/orders     →  checkout, tracking, cancel"],
  ["reviewRoutes.js",   "/api/reviews    →  write, read, delete reviews"],
  ["discountRoutes.js", "/api/discounts  →  create coupons, validate at checkout"],
  ["refundRoutes.js",   "/api/refunds    →  submit, view, approve/reject"],
  ["blogRoutes.js",     "/api/blogs      →  create, read, delete blog posts"],
  ["chatRoutes.js",     "/api/chat       →  fetch message history"],
  ["adminRoutes.js",    "/api/admin      →  site stats, user management"],
  ["vendorRoutes.js",   "/api/vendor     →  analytics, subscription plans"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

// ── FRONTEND ─────────────────────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, pageW, 46).fill(BLUE);
doc.fontSize(16).fillColor(WHITE).font("Helvetica-Bold")
   .text("Part 2 (continued) — Frontend File Structure", margin, 14);
doc.y = 66;

sectionTitle("Frontend  (d:\\Latest  NovaMart\\frontend\\)");

h1("Root Config Files");
tableRow(["File", "Purpose"], rfW, true);
[
  ["index.html",       "Root HTML shell — React app is injected here"],
  ["vite.config.js",   "Vite build tool configuration"],
  ["package.json",     "Lists all npm packages the frontend needs"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/  (all React source code lives here)");
tableRow(["File", "Purpose"], rfW, true);
[
  ["main.jsx",         "Mounts the React App into index.html"],
  ["App.jsx",          "Defines all 25 page routes of the application"],
  ["index.css",        "Global CSS reset applied to the whole app"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/utils/");
tableRow(["File", "Purpose"], rfW, true);
altTableRow(["api.js", "Axios instance with baseURL=localhost:5000 + auto JWT header"], rfW, 0);
doc.moveDown(0.5);

h1("src/context/  (global state shared across all pages)");
tableRow(["File", "Purpose"], rfW, true);
[
  ["AuthContext.jsx",  "Stores logged-in user, login(), logout(), register()"],
  ["CartContext.jsx",  "Stores cart count — updates the Navbar badge live"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/components/  (reusable pieces used across multiple pages)");
tableRow(["File", "Purpose"], rfW, true);
[
  ["Navbar.jsx",          "Top navigation bar — links change based on user role"],
  ["ProductCard.jsx",     "Product tile shown in grids — Add to Cart, Wishlist, Share"],
  ["ProtectedRoute.jsx",  "Redirects to /login if user is not logged in or wrong role"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/pages/  (customer-facing screens)");
tableRow(["File", "URL  →  What the page shows"], rfW, true);
[
  ["Home.jsx",            "/               →  Hero, categories, featured products, deals"],
  ["ProductList.jsx",     "/products       →  Search + filter sidebar + product grid"],
  ["ProductDetail.jsx",   "/products/:id   →  Full product info, specs, reviews, recommendations"],
  ["CartPage.jsx",        "/cart           →  Cart items with qty controls and total"],
  ["CheckoutPage.jsx",    "/checkout       →  Address, payment, coupon, place order"],
  ["WishlistPage.jsx",    "/wishlist       →  Saved products — move to cart or remove"],
  ["OrdersPage.jsx",      "/orders         →  Customer's full order history"],
  ["OrderDetailPage.jsx", "/orders/:id     →  Tracking progress bar + refund request form"],
  ["LoginPage.jsx",       "/login          →  Email & password login form"],
  ["RegisterPage.jsx",    "/register       →  Register as customer or vendor"],
  ["ProfilePage.jsx",     "/profile        →  Edit name, phone, address + loyalty badge"],
  ["ChatPage.jsx",        "/chat           →  Real-time Socket.io chat interface"],
  ["BlogPage.jsx",        "/blogs          →  Grid of all blog posts"],
  ["BlogDetailPage.jsx",  "/blogs/:id      →  Read a full blog post"],
  ["BlogCreatePage.jsx",  "/blogs/create   →  Write and publish a new blog post"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/pages/vendor/  (only approved vendors can access)");
tableRow(["File", "URL  →  What the page shows"], rfW, true);
[
  ["VendorDashboard.jsx",    "/vendor/dashboard    →  Revenue, orders, subscription overview"],
  ["VendorProducts.jsx",     "/vendor/products     →  Add / edit / delete own products"],
  ["VendorOrders.jsx",       "/vendor/orders       →  View orders and update status"],
  ["VendorAnalytics.jsx",    "/vendor/analytics    →  Sales chart, top products, monthly bars"],
  ["VendorSubscription.jsx", "/vendor/subscription →  Buy Basic or Premium membership plan"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

h1("src/pages/admin/  (only admin can access)");
tableRow(["File", "URL  →  What the page shows"], rfW, true);
[
  ["AdminDashboard.jsx",  "/admin/dashboard  →  Site-wide stats: users, orders, revenue"],
  ["AdminUsers.jsx",      "/admin/users      →  List all users, approve vendor accounts"],
  ["AdminCategories.jsx", "/admin/categories →  Add, edit, delete product categories"],
  ["AdminDiscounts.jsx",  "/admin/discounts  →  Create and manage coupon codes"],
  ["AdminRefunds.jsx",    "/admin/refunds    →  Approve or reject refund requests"],
  ["AdminOrders.jsx",     "/admin/orders     →  View all orders and update any status"],
].forEach((r, i) => altTableRow(r, rfW, i));
doc.moveDown(0.5);

// ── SUMMARY TABLE ────────────────────────────────────────────────────────────
sectionTitle("File Count Summary");
const smW = [inner * 0.5, inner * 0.25, inner * 0.25];
tableRow(["Section", "Files", "Folder"], smW, true);
[
  ["Backend — Route handlers",     "13", "backend/routes/"],
  ["Backend — Database models",    "12", "backend/models/"],
  ["Backend — Config & server",    " 3", "backend/"],
  ["Frontend — Customer pages",    "15", "frontend/src/pages/"],
  ["Frontend — Vendor pages",      " 5", "frontend/src/pages/vendor/"],
  ["Frontend — Admin pages",       " 6", "frontend/src/pages/admin/"],
  ["Frontend — Shared components", " 3", "frontend/src/components/"],
  ["Frontend — Context & utils",   " 3", "frontend/src/context/ + utils/"],
  ["Frontend — Entry files",       " 3", "frontend/src/"],
].forEach((r, i) => altTableRow(r, smW, i));

doc.moveDown(0.6);
doc.fontSize(11).fillColor(BLUE).font("Helvetica-Bold")
   .text("Total: 61 source files  (excluding node_modules and auto-generated files)", margin, doc.y, { align: "center" });

// ── WHICH FILE TO EDIT ───────────────────────────────────────────────────────
doc.moveDown(0.6);
sectionTitle("Quick Guide — Which File to Open When You Want to Change Something");
const qW = [inner * 0.55, inner * 0.45];
tableRow(["What you want to change", "File to open"], qW, true);
[
  ["Login / Register logic",            "backend/routes/authRoutes.js"],
  ["User database fields",              "backend/models/User.js"],
  ["Product database fields",           "backend/models/Product.js"],
  ["Top navigation bar links",          "frontend/src/components/Navbar.jsx"],
  ["Homepage layout",                   "frontend/src/pages/Home.jsx"],
  ["Add or remove a page route",        "frontend/src/App.jsx"],
  ["MongoDB connection URI",            "backend/config/db.js  or  backend/.env"],
  ["Change the server port",            "backend/.env  (PORT=5000)"],
  ["Cart add/remove logic",             "backend/routes/cartRoutes.js"],
  ["Order checkout logic",              "backend/routes/orderRoutes.js"],
  ["Vendor analytics calculation",      "backend/routes/vendorRoutes.js"],
  ["Admin approval of vendors",         "backend/routes/adminRoutes.js"],
  ["Real-time chat (Socket.io)",        "backend/server.js  +  frontend/src/pages/ChatPage.jsx"],
  ["Product search & filter logic",     "backend/routes/productRoutes.js"],
  ["Loyalty points calculation",        "backend/routes/orderRoutes.js  (updateLoyalty fn)"],
].forEach((r, i) => altTableRow(r, qW, i));

// ── FOOTER ───────────────────────────────────────────────────────────────────
const pageCount = doc.bufferedPageRange().count;
for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // Skip cover page footer
  doc.fontSize(8).fillColor("#aaaaaa").font("Helvetica")
     .text(
       `NovaMart — MERN Stack University Project Guide   |   Page ${i + 1} of ${pageCount}`,
       margin, doc.page.height - 30,
       { align: "center", width: inner }
     );
}

doc.end();
console.log(`PDF created: ${outputPath}`);
