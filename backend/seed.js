/**
 * NovaMart Seed Script
 * Creates: 1 vendor + 6 categories + 20 products per category (120 total)
 * Run: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User     = require("./models/User");
const Category = require("./models/Category");
const Product  = require("./models/Product");

// ── Picsum gives real photos keyed by seed string ──────────────────────────
const img = (seed, w = 500, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ── Vendor definition ───────────────────────────────────────────────────────
const VENDOR = {
  name: "Rahim Uddin",
  email: "vendor@novamart.com",
  password: "vendor123",
  role: "vendor",
  phone: "01712345678",
  storeName: "NovaMart Official Store",
  storeDescription: "Your one-stop destination for quality products at the best prices in Bangladesh.",
  isApproved: true,
};

// ── Category + product data ─────────────────────────────────────────────────
const SEED_DATA = [
  {
    category: { name: "Electronics", description: "Gadgets, devices and accessories", image: img("electronics-cat") },
    products: [
      { name: "Samsung Galaxy A54 5G", price: 38999, discountedPrice: 35500, brand: "Samsung", color: "Black", stock: 30, tags: ["smartphone","5g","samsung"], specs: "6.4\" AMOLED, 50MP Camera, 5000mAh", images: [img("samsung-a54"),img("samsung-a54-2")] },
      { name: "iPhone 13 (128GB)", price: 85000, discountedPrice: 80000, brand: "Apple", color: "Blue", stock: 15, tags: ["iphone","apple","smartphone"], specs: "6.1\" Super Retina XDR, A15 Bionic", images: [img("iphone13"),img("iphone13-2")] },
      { name: "Xiaomi Redmi Note 12", price: 21999, discountedPrice: 19999, brand: "Xiaomi", color: "Gray", stock: 45, tags: ["xiaomi","redmi","smartphone"], specs: "6.67\" AMOLED, 50MP, 5000mAh", images: [img("redmi-note12"),img("redmi-note12-2")] },
      { name: "HP Laptop 15s Core i5", price: 65000, discountedPrice: 60000, brand: "HP", color: "Silver", stock: 12, tags: ["laptop","hp","i5"], specs: "15.6\" FHD, Intel i5-12th Gen, 8GB RAM, 512GB SSD", images: [img("hp-laptop"),img("hp-laptop-2")] },
      { name: "Lenovo IdeaPad Slim 3", price: 52000, discountedPrice: null, brand: "Lenovo", color: "Gray", stock: 10, tags: ["laptop","lenovo","student"], specs: "15.6\" FHD, Ryzen 5, 8GB RAM, 256GB SSD", images: [img("lenovo-laptop"),img("lenovo-laptop-2")] },
      { name: "JBL Tune 510BT Headphones", price: 4500, discountedPrice: 3999, brand: "JBL", color: "Black", stock: 60, tags: ["headphones","jbl","wireless"], specs: "40mm drivers, 40hr battery, BT 5.0", images: [img("jbl-headphone"),img("jbl-headphone-2")] },
      { name: "Apple AirPods (3rd Gen)", price: 18000, discountedPrice: 16500, brand: "Apple", color: "White", stock: 25, tags: ["earbuds","apple","wireless"], specs: "Spatial Audio, MagSafe charging", images: [img("airpods"),img("airpods-2")] },
      { name: "Samsung Galaxy Watch 5", price: 28000, discountedPrice: 25000, brand: "Samsung", color: "Black", stock: 18, tags: ["smartwatch","samsung","wearable"], specs: "1.4\" AMOLED, GPS, Heart Rate, SpO2", images: [img("galaxy-watch"),img("galaxy-watch-2")] },
      { name: "Anker 65W GaN Charger", price: 2800, discountedPrice: 2499, brand: "Anker", color: "Black", stock: 100, tags: ["charger","gan","fast-charge"], specs: "65W PD, USB-C + USB-A, Foldable", images: [img("anker-charger"),img("anker-charger-2")] },
      { name: "Baseus 20000mAh Power Bank", price: 3500, discountedPrice: 2999, brand: "Baseus", color: "White", stock: 80, tags: ["powerbank","baseus","portable"], specs: "20000mAh, 65W Fast Charge, LED Display", images: [img("powerbank"),img("powerbank-2")] },
      { name: "Logitech MX Master 3 Mouse", price: 9500, discountedPrice: 8800, brand: "Logitech", color: "Graphite", stock: 35, tags: ["mouse","logitech","wireless"], specs: "4000 DPI, MagSpeed Scroll, 7 Buttons", images: [img("logitech-mouse"),img("logitech-mouse-2")] },
      { name: "Keychron K2 Mechanical Keyboard", price: 8500, discountedPrice: null, brand: "Keychron", color: "White", stock: 20, tags: ["keyboard","mechanical","keychron"], specs: "75% Layout, Hot-swappable, BT + USB-C", images: [img("mechanical-keyboard"),img("mechanical-keyboard-2")] },
      { name: "Dell 24\" IPS Monitor", price: 22000, discountedPrice: 19999, brand: "Dell", color: "Black", stock: 14, tags: ["monitor","dell","full-hd"], specs: "24\" FHD IPS, 75Hz, HDMI, VGA", images: [img("dell-monitor"),img("dell-monitor-2")] },
      { name: "TP-Link AC1200 WiFi Router", price: 3200, discountedPrice: 2900, brand: "TP-Link", color: "Black", stock: 55, tags: ["router","wifi","tp-link"], specs: "AC1200, Dual Band, 4 Antennas", images: [img("tp-link-router"),img("tp-link-router-2")] },
      { name: "Sony WH-1000XM5 Headphones", price: 32000, discountedPrice: 28000, brand: "Sony", color: "Silver", stock: 10, tags: ["headphones","sony","anc"], specs: "ANC, 30hr battery, LDAC, Quick Charge", images: [img("sony-xm5"),img("sony-xm5-2")] },
      { name: "Xiaomi Mi Band 8", price: 3500, discountedPrice: 2999, brand: "Xiaomi", color: "Black", stock: 90, tags: ["fitness","band","xiaomi"], specs: "1.62\" AMOLED, 16-day battery, SpO2, GPS", images: [img("mi-band"),img("mi-band-2")] },
      { name: "Seagate 1TB External HDD", price: 5500, discountedPrice: 4999, brand: "Seagate", color: "Black", stock: 40, tags: ["storage","hdd","seagate"], specs: "1TB, USB 3.0, Compact & Portable", images: [img("seagate-hdd"),img("seagate-hdd-2")] },
      { name: "ASUS TUF Gaming F15 Laptop", price: 95000, discountedPrice: 89000, brand: "ASUS", color: "Gray", stock: 8, tags: ["gaming","laptop","asus"], specs: "i7-12700H, RTX 3060, 16GB, 512GB SSD", images: [img("asus-tuf"),img("asus-tuf-2")] },
      { name: "Logitech C920 HD Webcam", price: 7500, discountedPrice: 6800, brand: "Logitech", color: "Black", stock: 28, tags: ["webcam","logitech","1080p"], specs: "1080p/30fps, Built-in Stereo Mic, USB", images: [img("logitech-webcam"),img("logitech-webcam-2")] },
      { name: "Philips 55W LED Desk Lamp", price: 1800, discountedPrice: 1499, brand: "Philips", color: "White", stock: 70, tags: ["lamp","philips","led"], specs: "55W Equiv, 3 Color Modes, Touch Dimmer", images: [img("philips-lamp"),img("philips-lamp-2")] },
    ],
  },
  {
    category: { name: "Fashion & Clothing", description: "Trendy clothes, shoes and accessories", image: img("fashion-cat") },
    products: [
      { name: "Men's Slim Fit Polo T-Shirt", price: 799, discountedPrice: 649, brand: "Aarong", color: "Navy Blue", stock: 120, tags: ["tshirt","polo","men"], specs: "100% Cotton, Machine Washable, Regular Fit", images: [img("polo-shirt"),img("polo-shirt-2")] },
      { name: "Women's Printed Kurti", price: 1200, discountedPrice: 950, brand: "Rang Bangladesh", color: "Multicolor", stock: 85, tags: ["kurti","women","printed"], specs: "Viscose Fabric, Block Print, S-XXL", images: [img("kurti"),img("kurti-2")] },
      { name: "Men's Slim Fit Jeans", price: 1899, discountedPrice: 1599, brand: "Yellow", color: "Dark Blue", stock: 60, tags: ["jeans","denim","men"], specs: "98% Cotton 2% Spandex, 5-Pocket, 28-38 Waist", images: [img("slim-jeans"),img("slim-jeans-2")] },
      { name: "Traditional Panjabi (Eid Special)", price: 2500, discountedPrice: 1999, brand: "Aarong", color: "White", stock: 50, tags: ["panjabi","eid","traditional"], specs: "Voile Cotton, Embroidery Work, M-XXL", images: [img("panjabi"),img("panjabi-2")] },
      { name: "Women's Silk Saree", price: 4500, discountedPrice: 3800, brand: "Tangail Saree", color: "Red & Gold", stock: 30, tags: ["saree","silk","women"], specs: "Pure Silk, Zari Border, 6 Yards", images: [img("silk-saree"),img("silk-saree-2")] },
      { name: "Men's Formal Oxford Shoes", price: 3200, discountedPrice: 2799, brand: "Bata", color: "Brown", stock: 40, tags: ["shoes","formal","men"], specs: "Genuine Leather, Rubber Sole, Size 40-45", images: [img("oxford-shoes"),img("oxford-shoes-2")] },
      { name: "Adidas Running Sneakers", price: 6500, discountedPrice: 5500, brand: "Adidas", color: "White/Black", stock: 35, tags: ["sneakers","adidas","running"], specs: "Mesh Upper, Cloudfoam Sole, Size 40-46", images: [img("adidas-sneaker"),img("adidas-sneaker-2")] },
      { name: "Winter Hoodie Sweatshirt", price: 1500, discountedPrice: 1199, brand: "H&M", color: "Black", stock: 75, tags: ["hoodie","winter","sweatshirt"], specs: "80% Cotton 20% Polyester, Kangaroo Pocket", images: [img("hoodie"),img("hoodie-2")] },
      { name: "Leather Bifold Wallet", price: 850, discountedPrice: 699, brand: "Fossil", color: "Brown", stock: 100, tags: ["wallet","leather","men"], specs: "Genuine Leather, 8 Card Slots, ID Window", images: [img("leather-wallet"),img("leather-wallet-2")] },
      { name: "Aviator Sunglasses UV400", price: 1200, discountedPrice: 899, brand: "Ray-Ban", color: "Gold Frame", stock: 65, tags: ["sunglasses","aviator","uv400"], specs: "UV400 Protection, Polarized, Metal Frame", images: [img("aviator-sunglasses"),img("aviator-sunglasses-2")] },
      { name: "Women's Floral Summer Dress", price: 1800, discountedPrice: 1399, brand: "Meena Bazaar", color: "Pink Floral", stock: 45, tags: ["dress","summer","women"], specs: "Chiffon, A-Line, S-XL, Machine Wash", images: [img("summer-dress"),img("summer-dress-2")] },
      { name: "Men's Reversible Belt", price: 699, discountedPrice: null, brand: "Louis Philippe", color: "Black/Brown", stock: 90, tags: ["belt","leather","men"], specs: "Genuine Leather, Reversible, Size 32-42", images: [img("leather-belt"),img("leather-belt-2")] },
      { name: "Canvas Tote Bag", price: 599, discountedPrice: 449, brand: "Local", color: "Natural", stock: 150, tags: ["bag","tote","canvas"], specs: "100% Cotton Canvas, 15L Capacity, Zip Closure", images: [img("tote-bag"),img("tote-bag-2")] },
      { name: "Nike Dri-FIT Sports Cap", price: 1200, discountedPrice: 999, brand: "Nike", color: "Black", stock: 80, tags: ["cap","nike","sports"], specs: "Dri-FIT Fabric, Adjustable Strap, One Size", images: [img("sports-cap"),img("sports-cap-2")] },
      { name: "Merino Wool Winter Scarf", price: 1100, discountedPrice: 899, brand: "Uniqlo", color: "Gray", stock: 55, tags: ["scarf","winter","wool"], specs: "100% Merino Wool, 180cm x 30cm", images: [img("wool-scarf"),img("wool-scarf-2")] },
      { name: "Women's Embroidered Salwar Kameez", price: 3200, discountedPrice: 2699, brand: "Aarong", color: "Teal", stock: 35, tags: ["salwar","kameez","women"], specs: "Cotton Blend, Hand Embroidery, S-XXL", images: [img("salwar-kameez"),img("salwar-kameez-2")] },
      { name: "Kids School Backpack", price: 1500, discountedPrice: 1199, brand: "Skybags", color: "Blue", stock: 60, tags: ["backpack","kids","school"], specs: "20L, Waterproof, Laptop Sleeve, USB Port", images: [img("school-backpack"),img("school-backpack-2")] },
      { name: "Premium Cotton Socks (6 Pairs)", price: 450, discountedPrice: 350, brand: "Marks & Spencer", color: "Multicolor", stock: 200, tags: ["socks","cotton","pack"], specs: "100% Combed Cotton, Anti-odor, Size 40-46", images: [img("cotton-socks"),img("cotton-socks-2")] },
      { name: "Leather Ankle Boots", price: 4500, discountedPrice: 3800, brand: "Clarks", color: "Tan Brown", stock: 25, tags: ["boots","leather","women"], specs: "Genuine Leather, 3cm Heel, Side Zip, Size 36-41", images: [img("ankle-boots"),img("ankle-boots-2")] },
      { name: "Men's Formal Blazer", price: 5500, discountedPrice: 4800, brand: "Raymond", color: "Navy", stock: 20, tags: ["blazer","formal","men"], specs: "Polyester Blend, 2-Button, S-XXL, Dry Clean", images: [img("formal-blazer"),img("formal-blazer-2")] },
    ],
  },
  {
    category: { name: "Home & Kitchen", description: "Everything for your home and kitchen", image: img("home-kitchen-cat") },
    products: [
      { name: "Walton Rice Cooker 2.8L", price: 3200, discountedPrice: 2799, brand: "Walton", color: "White", stock: 45, tags: ["rice-cooker","kitchen","walton"], specs: "2.8L Capacity, Keep Warm, Non-stick Pot", images: [img("rice-cooker"),img("rice-cooker-2")] },
      { name: "Philips Blender HR2056", price: 4500, discountedPrice: 3999, brand: "Philips", color: "White", stock: 30, tags: ["blender","philips","kitchen"], specs: "600W, 1.5L Jar, Stainless Steel Blades", images: [img("blender"),img("blender-2")] },
      { name: "Electric Kettle 1.7L Stainless", price: 1800, discountedPrice: 1499, brand: "Miyako", color: "Silver", stock: 65, tags: ["kettle","electric","kitchen"], specs: "1.7L, 1500W, Auto Shutoff, Boil-Dry Protection", images: [img("electric-kettle"),img("electric-kettle-2")] },
      { name: "Ceramic Dinner Set (18 Pieces)", price: 5500, discountedPrice: 4500, brand: "Corelle", color: "White & Blue", stock: 20, tags: ["dinner-set","ceramic","kitchen"], specs: "18 Pieces, Microwave Safe, Dishwasher Safe", images: [img("dinner-set"),img("dinner-set-2")] },
      { name: "Non-stick Frying Pan 26cm", price: 2200, discountedPrice: 1799, brand: "Tefal", color: "Black", stock: 50, tags: ["frying-pan","non-stick","kitchen"], specs: "26cm, Thermo-Signal, Induction Compatible", images: [img("frying-pan"),img("frying-pan-2")] },
      { name: "Stainless Steel Water Bottle 1L", price: 750, discountedPrice: 599, brand: "Milton", color: "Silver", stock: 120, tags: ["water-bottle","stainless","reusable"], specs: "1L, Double Wall Insulated, BPA Free, 24hr Cold", images: [img("water-bottle"),img("water-bottle-2")] },
      { name: "Bedsheet Set Double (4 Pcs)", price: 3000, discountedPrice: 2499, brand: "Besta", color: "Sky Blue", stock: 40, tags: ["bedsheet","cotton","home"], specs: "100% Cotton, 230TC, 1 Sheet + 2 Pillowcase + 1 Duvet", images: [img("bedsheet"),img("bedsheet-2")] },
      { name: "Memory Foam Sleeping Pillow", price: 1800, discountedPrice: 1499, brand: "Springfit", color: "White", stock: 55, tags: ["pillow","memory-foam","sleeping"], specs: "60x40cm, Hypoallergenic, Washable Cover", images: [img("memory-pillow"),img("memory-pillow-2")] },
      { name: "Digital Wall Clock (30cm)", price: 1200, discountedPrice: 999, brand: "Seiko", color: "Black", stock: 70, tags: ["clock","wall","digital"], specs: "30cm Diameter, Date & Temp Display, Silent Sweep", images: [img("wall-clock"),img("wall-clock-2")] },
      { name: "Full-Length Standing Mirror", price: 4500, discountedPrice: 3800, brand: "IKEA", color: "Black Frame", stock: 15, tags: ["mirror","standing","bedroom"], specs: "165 x 55cm, Aluminum Frame, Wall Mount Option", images: [img("standing-mirror"),img("standing-mirror-2")] },
      { name: "Aroma Diffuser 400ml", price: 2200, discountedPrice: 1799, brand: "InnoGear", color: "White", stock: 45, tags: ["diffuser","aroma","home"], specs: "400ml, 7 LED Colors, Auto Shutoff, 13hr Mist", images: [img("aroma-diffuser"),img("aroma-diffuser-2")] },
      { name: "Curtain Set (2 Panels) 54\"", price: 2800, discountedPrice: 2299, brand: "Home Centre", color: "Beige", stock: 35, tags: ["curtains","home","living-room"], specs: "2 Panels, 54\" x 84\", Blackout Fabric, Rod Pocket", images: [img("curtains"),img("curtains-2")] },
      { name: "Stainless Steel Vacuum Flask 500ml", price: 950, discountedPrice: 749, brand: "Thermos", color: "Red", stock: 90, tags: ["flask","vacuum","travel"], specs: "500ml, 18/8 Stainless Steel, 12hr Hot/24hr Cold", images: [img("vacuum-flask"),img("vacuum-flask-2")] },
      { name: "Bathroom Accessories Set (5 Pcs)", price: 1500, discountedPrice: 1199, brand: "Home Essential", color: "Chrome", stock: 40, tags: ["bathroom","accessories","home"], specs: "5 Pcs: Soap Dispenser, Toothbrush Holder, Cup, Tray, Brush", images: [img("bathroom-set"),img("bathroom-set-2")] },
      { name: "Air Fryer 3.5L Digital", price: 7500, discountedPrice: 6500, brand: "Xiaomi", color: "Black", stock: 22, tags: ["air-fryer","kitchen","digital"], specs: "3.5L, 1400W, 8 Preset Programs, Touch Screen", images: [img("air-fryer"),img("air-fryer-2")] },
      { name: "Microwave Oven 20L Solo", price: 12000, discountedPrice: 10500, brand: "Samsung", color: "Black", stock: 18, tags: ["microwave","samsung","kitchen"], specs: "20L, 700W, 5 Power Levels, Auto Cook 8 Menus", images: [img("microwave"),img("microwave-2")] },
      { name: "Wooden Chopping Board Large", price: 850, discountedPrice: 699, brand: "Prestige", color: "Natural Wood", stock: 80, tags: ["chopping-board","wood","kitchen"], specs: "38 x 25cm, Acacia Wood, Juice Groove, Anti-slip", images: [img("chopping-board"),img("chopping-board-2")] },
      { name: "Table Lamp with USB Port", price: 1600, discountedPrice: 1299, brand: "Philips", color: "White", stock: 55, tags: ["lamp","table","usb"], specs: "10W LED, 3 Brightness Levels, USB Charging Port", images: [img("table-lamp"),img("table-lamp-2")] },
      { name: "Stainless Pressure Cooker 5L", price: 3500, discountedPrice: 2999, brand: "Hawkins", color: "Silver", stock: 30, tags: ["pressure-cooker","stainless","kitchen"], specs: "5L, ISI Marked, 3 Safety Valves, Induction Safe", images: [img("pressure-cooker"),img("pressure-cooker-2")] },
      { name: "Cordless Electric Iron 2200W", price: 2800, discountedPrice: 2499, brand: "Philips", color: "Blue/White", stock: 38, tags: ["iron","electric","cordless"], specs: "2200W, Steam Burst 140g/min, Non-stick Soleplate", images: [img("electric-iron"),img("electric-iron-2")] },
    ],
  },
  {
    category: { name: "Books & Stationery", description: "Books, educational and office supplies", image: img("books-cat") },
    products: [
      { name: "A4 Premium Notebook 200 Pages", price: 180, discountedPrice: 149, brand: "Navana", color: "Blue", stock: 300, tags: ["notebook","a4","stationery"], specs: "A4, 200 Pages, 70gsm Ruled Paper, Hardcover", images: [img("a4-notebook"),img("a4-notebook-2")] },
      { name: "Ballpoint Pen Set (12 Pcs)", price: 250, discountedPrice: 199, brand: "Reynolds", color: "Blue/Black/Red", stock: 500, tags: ["pen","ballpoint","set"], specs: "12 Pcs, Smooth Flow, 0.7mm, Assorted Colors", images: [img("pen-set"),img("pen-set-2")] },
      { name: "Zebra Mechanical Pencil 0.5mm", price: 350, discountedPrice: 299, brand: "Zebra", color: "Black", stock: 200, tags: ["pencil","mechanical","zebra"], specs: "0.5mm Lead, Cushion Tip, Grip Zone", images: [img("mechanical-pencil"),img("mechanical-pencil-2")] },
      { name: "Mildliner Highlighter Set (10 Colors)", price: 650, discountedPrice: 549, brand: "Zebra", color: "Multicolor", stock: 180, tags: ["highlighter","mildliner","set"], specs: "10 Colors, Double-ended, Mild & Fluorescent Ink", images: [img("mildliner"),img("mildliner-2")] },
      { name: "Sticky Notes Pack (4 Colors, 400 Sheets)", price: 220, discountedPrice: 179, brand: "Post-it", color: "Multicolor", stock: 400, tags: ["sticky-notes","post-it","office"], specs: "4 Colors, 100 Sheets Each, 76 x 76mm", images: [img("sticky-notes"),img("sticky-notes-2")] },
      { name: "Wooden Desk Organizer 6-Compartment", price: 1200, discountedPrice: 999, brand: "Bamboo", color: "Natural Wood", stock: 60, tags: ["organizer","desk","wooden"], specs: "6 Compartments, Bamboo, 25 x 18 x 8cm", images: [img("desk-organizer"),img("desk-organizer-2")] },
      { name: "Geometry Box (11 Pcs)", price: 350, discountedPrice: 280, brand: "Staedtler", color: "Blue", stock: 250, tags: ["geometry","math","school"], specs: "11 Pcs: Compass, Protractor, Set Squares, Ruler", images: [img("geometry-box"),img("geometry-box-2")] },
      { name: "Stapler + 1000 Staples Bundle", price: 450, discountedPrice: 380, brand: "Kangaro", color: "Gray", stock: 150, tags: ["stapler","office","bundle"], specs: "26/6, Half-Strip, 20 Sheet Cap, 1000 Staples Included", images: [img("stapler"),img("stapler-2")] },
      { name: "Faber-Castell Sketch Pen Set (36 Colors)", price: 850, discountedPrice: 699, brand: "Faber-Castell", color: "Multicolor", stock: 120, tags: ["sketch-pen","faber","art"], specs: "36 Colors, Water-based, Non-toxic, Washable", images: [img("sketch-pens"),img("sketch-pens-2")] },
      { name: "Winsor & Newton Watercolor Set", price: 2200, discountedPrice: 1899, brand: "Winsor & Newton", color: "Multicolor", stock: 45, tags: ["watercolor","art","winsor"], specs: "24 Colors, Pan Set, Travel Case Included", images: [img("watercolor-set"),img("watercolor-set-2")] },
      { name: "A3 Drawing Sketchbook 60 Pages", price: 280, discountedPrice: null, brand: "Navana", color: "White", stock: 200, tags: ["sketchbook","a3","drawing"], specs: "A3, 60 Pages, 150gsm Cartridge Paper, Spiral Bound", images: [img("sketchbook"),img("sketchbook-2")] },
      { name: "Self-Laminating Name Tag Labels (50 Pcs)", price: 180, discountedPrice: 149, brand: "Avery", color: "Transparent", stock: 300, tags: ["label","name-tag","office"], specs: "50 Pcs, Self-laminating, Waterproof, Write-on", images: [img("name-tags"),img("name-tags-2")] },
      { name: "Scientific Calculator Casio FX-991EX", price: 1800, discountedPrice: 1599, brand: "Casio", color: "Black", stock: 80, tags: ["calculator","casio","scientific"], specs: "552 Functions, Natural Display, Spreadsheet, Exam Mode", images: [img("casio-calc"),img("casio-calc-2")] },
      { name: "Document File Folder A4 (10 Pcs)", price: 350, discountedPrice: 280, brand: "Beautone", color: "Assorted", stock: 250, tags: ["folder","file","office"], specs: "A4 Size, Polypropylene, Button Lock, 10 Pcs Pack", images: [img("file-folder"),img("file-folder-2")] },
      { name: "Whiteboard Marker Set (8 Colors)", price: 320, discountedPrice: 259, brand: "Artline", color: "Multicolor", stock: 180, tags: ["whiteboard","marker","office"], specs: "8 Colors, Chisel Tip, Quick Dry, Erasable", images: [img("whiteboard-marker"),img("whiteboard-marker-2")] },
      { name: "Binder Ring Folder A4 (2 Inch)", price: 280, discountedPrice: 230, brand: "Pilot", color: "Black", stock: 200, tags: ["binder","folder","office"], specs: "A4, 2\" D-Ring, 450 Sheet, Hard Board Cover", images: [img("ring-binder"),img("ring-binder-2")] },
      { name: "Correction Tape 5mm x 6m (3 Pcs)", price: 150, discountedPrice: 119, brand: "Pentel", color: "White", stock: 400, tags: ["correction","tape","school"], specs: "5mm x 6m, Non-refillable, Smooth Application, 3 Pcs", images: [img("correction-tape"),img("correction-tape-2")] },
      { name: "Cello Tape Dispenser + 2 Rolls", price: 220, discountedPrice: null, brand: "3M Scotch", color: "Transparent", stock: 300, tags: ["tape","dispenser","office"], specs: "Desktop Dispenser, 19mm x 33m x 2 Rolls", images: [img("tape-dispenser"),img("tape-dispenser-2")] },
      { name: "Pencil Box with Lock (Aluminum)", price: 499, discountedPrice: 399, brand: "M&G", color: "Silver", stock: 150, tags: ["pencil-box","aluminum","school"], specs: "Aluminum, Magnetic Lock, 2-Layer, 21 x 8 x 3.5cm", images: [img("pencil-box"),img("pencil-box-2")] },
      { name: "Black Canvas Art Portfolio Bag A3", price: 1100, discountedPrice: 899, brand: "Daler-Rowney", color: "Black", stock: 55, tags: ["portfolio","art","a3"], specs: "A3, Canvas, Zip Closure, Shoulder Strap, 4 Inner Pockets", images: [img("art-portfolio"),img("art-portfolio-2")] },
    ],
  },
  {
    category: { name: "Sports & Fitness", description: "Sports equipment and fitness gear", image: img("sports-cat") },
    products: [
      { name: "Adjustable Dumbbell Set 2-20kg", price: 8500, discountedPrice: 7500, brand: "PowerMax", color: "Black", stock: 25, tags: ["dumbbell","gym","fitness"], specs: "2-20kg, Adjustable, Rubber Coated, 2 pcs", images: [img("dumbbell-set"),img("dumbbell-set-2")] },
      { name: "Yoga Mat 6mm Non-Slip", price: 1500, discountedPrice: 1199, brand: "Lifelong", color: "Purple", stock: 70, tags: ["yoga","mat","fitness"], specs: "183 x 61cm, 6mm Thick, NBR Foam, Carrying Strap", images: [img("yoga-mat"),img("yoga-mat-2")] },
      { name: "Jump Rope with Counter", price: 650, discountedPrice: 499, brand: "Decathlon", color: "Blue", stock: 100, tags: ["jump-rope","cardio","fitness"], specs: "3m Cable, LCD Counter, Ball-bearing Handle, Adjustable", images: [img("jump-rope"),img("jump-rope-2")] },
      { name: "Resistance Bands Set (5 Bands)", price: 1200, discountedPrice: 999, brand: "Fit Simplify", color: "Multicolor", stock: 85, tags: ["resistance-band","workout","fitness"], specs: "5 Resistance Levels, Natural Latex, 12\" Width", images: [img("resistance-bands"),img("resistance-bands-2")] },
      { name: "Pull-up Bar Doorframe (No Screws)", price: 2200, discountedPrice: 1899, brand: "Iron Gym", color: "Black", stock: 35, tags: ["pull-up","bar","home-gym"], specs: "Max 100kg, Adjustable 60-100cm, Multi-grip", images: [img("pullup-bar"),img("pullup-bar-2")] },
      { name: "Running Shoes Nike Air Max", price: 9500, discountedPrice: 8000, brand: "Nike", color: "White/Red", stock: 30, tags: ["running","shoes","nike"], specs: "Air Cushioning, Breathable Mesh, Size 40-46", images: [img("nike-airmax"),img("nike-airmax-2")] },
      { name: "Badminton Racket Yonex Arcsaber", price: 4500, discountedPrice: 3800, brand: "Yonex", color: "Blue", stock: 28, tags: ["badminton","racket","yonex"], specs: "5U/G4, Graphite, Box Frame, 85g", images: [img("badminton-racket"),img("badminton-racket-2")] },
      { name: "Cricket Bat Kashmir Willow", price: 3500, discountedPrice: null, brand: "Cosco", color: "Natural Wood", stock: 20, tags: ["cricket","bat","kashmir-willow"], specs: "Full Size, Kashmir Willow, Pre-Knocked, 1.2kg", images: [img("cricket-bat"),img("cricket-bat-2")] },
      { name: "Adidas Football Size 5", price: 2800, discountedPrice: 2399, brand: "Adidas", color: "Black/White", stock: 40, tags: ["football","adidas","size-5"], specs: "Size 5, Thermally Bonded, FIFA Basic Certified", images: [img("adidas-football"),img("adidas-football-2")] },
      { name: "Fitness Tracker Smartband", price: 3200, discountedPrice: 2699, brand: "Huawei", color: "Black", stock: 50, tags: ["fitness-tracker","smartband","health"], specs: "Heart Rate, SpO2, Sleep Monitor, 10-day Battery", images: [img("fitness-band"),img("fitness-band-2")] },
      { name: "Gym Sports Bag 30L", price: 1800, discountedPrice: 1499, brand: "Under Armour", color: "Black", stock: 55, tags: ["gym-bag","sports","duffel"], specs: "30L, Wet/Dry Compartment, Shoe Pocket, Adjustable Strap", images: [img("gym-bag"),img("gym-bag-2")] },
      { name: "Knee Support Brace Pair", price: 999, discountedPrice: 799, brand: "Tynor", color: "Beige", stock: 80, tags: ["knee-brace","support","sports"], specs: "Neoprene, Open Patella, Size S-XL, 1 Pair", images: [img("knee-brace"),img("knee-brace-2")] },
      { name: "Protein Shaker Bottle 700ml", price: 550, discountedPrice: 449, brand: "Optimum Nutrition", color: "Black", stock: 120, tags: ["shaker","protein","gym"], specs: "700ml, BPA Free, Leak Proof, Mixing Ball", images: [img("shaker-bottle"),img("shaker-bottle-2")] },
      { name: "Ab Roller Wheel with Knee Pad", price: 750, discountedPrice: 599, brand: "Vinsguir", color: "Black", stock: 75, tags: ["ab-roller","core","fitness"], specs: "Dual Wheel, Non-slip Handles, EVA Knee Pad", images: [img("ab-roller"),img("ab-roller-2")] },
      { name: "Swimming Goggles Anti-Fog", price: 1200, discountedPrice: 999, brand: "Speedo", color: "Blue", stock: 60, tags: ["swimming","goggles","speedo"], specs: "UV Protection, Anti-Fog, Adjustable Strap, Case Included", images: [img("swim-goggles"),img("swim-goggles-2")] },
      { name: "Cycling Helmet Adjustable", price: 3200, discountedPrice: 2699, brand: "Scott", color: "Red", stock: 22, tags: ["cycling","helmet","safety"], specs: "In-Mold, 20 Vents, Adjustable Fit, CE EN1078", images: [img("cycling-helmet"),img("cycling-helmet-2")] },
      { name: "Workout Gloves Wrist Support", price: 850, discountedPrice: 699, brand: "Harbinger", color: "Black", stock: 90, tags: ["gloves","gym","workout"], specs: "Leather Palm, Wrist Wrap, Size S-XL", images: [img("workout-gloves"),img("workout-gloves-2")] },
      { name: "Basketball Spalding Size 7", price: 3500, discountedPrice: 3000, brand: "Spalding", color: "Orange", stock: 25, tags: ["basketball","spalding","outdoor"], specs: "Size 7, Rubber, Indoor/Outdoor, Deep Channel Design", images: [img("basketball"),img("basketball-2")] },
      { name: "Foam Roller 33cm Deep Tissue", price: 1200, discountedPrice: 999, brand: "TriggerPoint", color: "Black", stock: 50, tags: ["foam-roller","recovery","fitness"], specs: "33cm, EPP Foam, 500 lbs Capacity, Multi-density", images: [img("foam-roller"),img("foam-roller-2")] },
      { name: "Treadmill Home Use Foldable", price: 35000, discountedPrice: 30000, brand: "PowerFit", color: "Black/Silver", stock: 8, tags: ["treadmill","cardio","home-gym"], specs: "1.5HP, 0-12kmh, LCD Display, Foldable, Max 100kg", images: [img("treadmill"),img("treadmill-2")] },
    ],
  },
  {
    category: { name: "Beauty & Personal Care", description: "Skincare, makeup and grooming products", image: img("beauty-cat") },
    products: [
      { name: "Cetaphil Gentle Skin Cleanser 500ml", price: 1200, discountedPrice: 999, brand: "Cetaphil", color: "White", stock: 90, tags: ["face-wash","cleanser","cetaphil"], specs: "500ml, Fragrance-free, For Sensitive Skin, Dermat Tested", images: [img("cetaphil-cleanser"),img("cetaphil-cleanser-2")] },
      { name: "Neutrogena Hydro Boost Moisturizer", price: 1800, discountedPrice: 1499, brand: "Neutrogena", color: "White", stock: 65, tags: ["moisturizer","hydro-boost","skincare"], specs: "50ml, Hyaluronic Acid, Oil-Free, Non-Comedogenic", images: [img("neutrogena-moisturizer"),img("neutrogena-moisturizer-2")] },
      { name: "Sunscreen SPF50+ PA+++ 75ml", price: 950, discountedPrice: 799, brand: "Biore UV", color: "White", stock: 110, tags: ["sunscreen","spf50","uv-protection"], specs: "75ml, SPF50+ PA+++, Lightweight, Matte Finish", images: [img("sunscreen"),img("sunscreen-2")] },
      { name: "Maybelline Fit Me Foundation", price: 1500, discountedPrice: 1299, brand: "Maybelline", color: "130 Buff Beige", stock: 55, tags: ["foundation","makeup","maybelline"], specs: "30ml, SPF18, Oil-Free, 40 Shades, Buildable Coverage", images: [img("maybelline-foundation"),img("maybelline-foundation-2")] },
      { name: "MAC Lipstick Matte 3g", price: 2200, discountedPrice: 1899, brand: "MAC", color: "Ruby Woo (Red)", stock: 40, tags: ["lipstick","mac","matte"], specs: "3g, Intense Matte Finish, Long-wearing, 20 Shades", images: [img("mac-lipstick"),img("mac-lipstick-2")] },
      { name: "Maybelline Sky High Mascara", price: 1100, discountedPrice: 899, brand: "Maybelline", color: "Blackest Black", stock: 75, tags: ["mascara","maybelline","lashes"], specs: "7.2ml, Volumizing, Lengthening, Buildable, Washable", images: [img("mascara"),img("mascara-2")] },
      { name: "Eyebrow Pencil with Brush", price: 450, discountedPrice: 380, brand: "NYX", color: "Brunette", stock: 100, tags: ["eyebrow","pencil","nyx"], specs: "Micro-Precision Tip, Spoolie Brush, Smudge-proof", images: [img("eyebrow-pencil"),img("eyebrow-pencil-2")] },
      { name: "L'Oreal Paris Kajal Magique", price: 350, discountedPrice: 280, brand: "L'Oreal", color: "Black", stock: 150, tags: ["kajal","eyeliner","loreal"], specs: "0.35g, Intense Black, 24hr Longevity, Smudge-proof", images: [img("kajal"),img("kajal-2")] },
      { name: "OPI Nail Polish Gel Effect 15ml", price: 1200, discountedPrice: 999, brand: "OPI", color: "Bubble Bath (Nude)", stock: 70, tags: ["nail-polish","opi","gel"], specs: "15ml, Gel-like Shine, 7-Day Wear, No-chip Formula", images: [img("nail-polish"),img("nail-polish-2")] },
      { name: "TRESemmé Hair Serum 50ml", price: 650, discountedPrice: 525, brand: "TRESemmé", color: "Golden", stock: 90, tags: ["hair-serum","tresemme","frizz-control"], specs: "50ml, Keratin Smooth, Anti-Frizz, Heat Protection 230°C", images: [img("hair-serum"),img("hair-serum-2")] },
      { name: "Head & Shoulders Shampoo 400ml", price: 680, discountedPrice: 560, brand: "Head & Shoulders", color: "White", stock: 130, tags: ["shampoo","anti-dandruff","h&s"], specs: "400ml, Anti-dandruff, Pyrithione Zinc, 2-in-1", images: [img("head-shoulders"),img("head-shoulders-2")] },
      { name: "Dove Conditioner 335ml", price: 620, discountedPrice: 499, brand: "Dove", color: "White", stock: 110, tags: ["conditioner","dove","hair-care"], specs: "335ml, Intensive Repair, Keratin Actives, All Hair Types", images: [img("dove-conditioner"),img("dove-conditioner-2")] },
      { name: "Vitamin C Serum 30ml", price: 1500, discountedPrice: 1199, brand: "The Ordinary", color: "Orange", stock: 55, tags: ["serum","vitamin-c","skincare"], specs: "30ml, 10% Ascorbic Acid + Alpha Arbutin, Brightening", images: [img("vitamin-c-serum"),img("vitamin-c-serum-2")] },
      { name: "Clay Face Mask 100ml", price: 899, discountedPrice: 749, brand: "Innisfree", color: "Green", stock: 65, tags: ["face-mask","clay","innisfree"], specs: "100ml, Jeju Volcanic Clay, Pore Cleansing, All Skin Types", images: [img("clay-mask"),img("clay-mask-2")] },
      { name: "Calvin Klein CK One EDT 100ml", price: 7500, discountedPrice: 6500, brand: "Calvin Klein", color: "Clear", stock: 20, tags: ["perfume","ck-one","unisex"], specs: "100ml EDT, Unisex, Fresh Citrus, 6-8hr Longevity", images: [img("ck-one-perfume"),img("ck-one-perfume-2")] },
      { name: "Dove Men Body Wash 500ml", price: 750, discountedPrice: 620, brand: "Dove", color: "Blue", stock: 100, tags: ["body-wash","dove","men"], specs: "500ml, 1/4 Moisturizing Cream, Deep Clean Formula", images: [img("dove-bodywash"),img("dove-bodywash-2")] },
      { name: "Parachute Coconut Hair Oil 200ml", price: 220, discountedPrice: 189, brand: "Parachute", color: "Clear", stock: 200, tags: ["hair-oil","coconut","parachute"], specs: "200ml, 100% Pure Coconut Oil, Cold Pressed", images: [img("coconut-oil"),img("coconut-oil-2")] },
      { name: "Vaseline Intensive Care Lotion 400ml", price: 450, discountedPrice: 380, brand: "Vaseline", color: "White", stock: 160, tags: ["body-lotion","vaseline","moisturizing"], specs: "400ml, Deep Moisture, Non-greasy, 48hr Hydration", images: [img("vaseline-lotion"),img("vaseline-lotion-2")] },
      { name: "Nivea Deo Roll-on 50ml", price: 280, discountedPrice: 239, brand: "Nivea", color: "White", stock: 180, tags: ["deodorant","nivea","roll-on"], specs: "50ml, 48hr Protection, Alcohol-free, Sensitive Skin", images: [img("nivea-deo"),img("nivea-deo-2")] },
      { name: "Lip Balm Set SPF30 (4 Pcs)", price: 680, discountedPrice: 549, brand: "Burt's Bees", color: "Multicolor", stock: 120, tags: ["lip-balm","spf30","beeswax"], specs: "4 Pcs, SPF30, Beeswax & Vitamin E, 4 Flavors", images: [img("lip-balm-set"),img("lip-balm-set-2")] },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildDescription = (p) =>
  `${p.name} — ${p.specs}. Premium quality product from ${p.brand}. ` +
  `Perfect for everyday use. Available in ${p.color}. Stock: ${p.stock} units. ` +
  `Satisfaction guaranteed with easy returns.`;

// ── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // 1. Create or fetch vendor
  // Pass plain password — the User model's pre-save hook handles hashing
  let vendor = await User.findOne({ email: VENDOR.email });
  if (!vendor) {
    vendor = await User.create({ ...VENDOR });
    console.log(`✅ Vendor created → ${vendor.email}  (password: ${VENDOR.password})`);
  } else {
    console.log(`⚡ Vendor already exists → ${vendor.email}`);
  }

  // 2. Seed categories + products
  let totalProducts = 0;
  for (const group of SEED_DATA) {
    // Create category if missing
    let cat = await Category.findOne({ name: group.category.name });
    if (!cat) {
      cat = await Category.create(group.category);
      console.log(`✅ Category created → ${cat.name}`);
    } else {
      console.log(`⚡ Category exists → ${cat.name}`);
    }

    // Add only the products that don't already exist (by name)
    let added = 0;
    for (const p of group.products) {
      const exists = await Product.findOne({ name: p.name, vendor: vendor._id });
      if (exists) { console.log(`   ⚠ Skip (exists): ${p.name}`); continue; }

      await Product.create({
        name: p.name,
        description: buildDescription(p),
        price: p.price,
        discountedPrice: p.discountedPrice || null,
        images: p.images,
        category: cat._id,
        vendor: vendor._id,
        brand: p.brand,
        color: p.color,
        stock: p.stock,
        stockStatus: p.stock > 5 ? "in-stock" : p.stock > 0 ? "low-stock" : "out-of-stock",
        tags: p.tags,
        specifications: p.specs,
        isActive: true,
      });
      added++;
    }
    totalProducts += added;
    console.log(`   ➕ Added ${added} products to "${cat.name}"`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Vendor  : ${VENDOR.email}  /  ${VENDOR.password}`);
  console.log(`   Products: ${totalProducts} new products added`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error("❌ Seed failed:", err.message); process.exit(1); });
