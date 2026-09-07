const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,      // No two users can have the same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"], // Only these 3 roles are allowed
      default: "customer",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },

    // --- Vendor-only fields ---
    storeName: {
      type: String,
      default: "",
    },
    storeDescription: {
      type: String,
      default: "",
    },
    // Admin must approve a vendor before they can sell
    isApproved: {
      type: Boolean,
      default: false,
    },

    // --- Feature 17: Loyalty Rewards ---
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    loyaltyBadge: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      default: "bronze",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// --- Password Hashing ---
// Before saving a user, hash the password if it was changed.
// In Mongoose 9, async pre-hooks must NOT call next() — just return or throw.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // Skip if password not changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
