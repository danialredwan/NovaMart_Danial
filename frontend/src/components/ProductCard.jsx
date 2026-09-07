import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../utils/api";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to add items to cart");
    setAddingToCart(true);
    try {
      await api.post("/cart", { productId: product._id, quantity: 1 });
      refreshCart();
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to use wishlist");
    try {
      await api.post(`/wishlist/${product._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to wishlist");
    }
  };

  const shareProduct = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/products/${product._id}`);
    alert("Link copied!");
  };

  const displayPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  const stockStyle = {
    "in-stock":     { bg: "#d1fae5", color: "#065f46" },
    "low-stock":    { bg: "#fef3c7", color: "#92400e" },
    "out-of-stock": { bg: "#fee2e2", color: "#991b1b" },
  }[product.stockStatus] || { bg: "#f1f5f9", color: "#475569" };

  return (
    <Link
      to={`/products/${product._id}`}
      style={{
        ...styles.card,
        boxShadow: hovered ? "0 12px 24px -4px rgba(99,102,241,0.18), 0 4px 8px -2px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div style={styles.imageWrap}>
        <img
          src={product.images?.[0] || "https://placehold.co/300x200?text=No+Image"}
          alt={product.name}
          style={styles.image}
        />
        {hasDiscount && (
          <span style={styles.discountBadge}>-{discountPct}%</span>
        )}
        {/* Hover action buttons */}
        <div style={{...styles.hoverActions, opacity: hovered ? 1 : 0}}>
          <button onClick={addToWishlist} style={styles.hoverBtn} title="Wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button onClick={shareProduct} style={styles.hoverBtn} title="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <p style={styles.storeName}>{product.vendor?.storeName || product.vendor?.name || "Store"}</p>
        <p style={styles.name}>{product.name}</p>

        {/* Rating */}
        <div style={styles.ratingRow}>
          <span style={styles.stars}>
            {"★".repeat(Math.round(product.averageRating || 0))}
            {"☆".repeat(5 - Math.round(product.averageRating || 0))}
          </span>
          <span style={styles.ratingCount}>({product.totalReviews || 0})</span>
        </div>

        {/* Price */}
        <div style={styles.priceRow}>
          <span style={styles.price}>৳{displayPrice}</span>
          {hasDiscount && <span style={styles.originalPrice}>৳{product.price}</span>}
        </div>

        {/* Stock */}
        <span style={{...styles.stockBadge, background: stockStyle.bg, color: stockStyle.color}}>
          {product.stockStatus}
        </span>

        {/* Add to cart */}
        <button
          onClick={addToCart}
          disabled={addingToCart || product.stockStatus === "out-of-stock"}
          style={{
            ...styles.cartBtn,
            background: product.stockStatus === "out-of-stock" ? "#e2e8f0" : "#6366f1",
            color: product.stockStatus === "out-of-stock" ? "#94a3b8" : "#fff",
            cursor: product.stockStatus === "out-of-stock" ? "not-allowed" : "pointer",
          }}
        >
          {addingToCart ? "Adding..." : product.stockStatus === "out-of-stock" ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    textDecoration: "none",
    color: "#1e293b",
    border: "1px solid #e2e8f0",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  },
  imageWrap: {
    position: "relative",
    overflow: "hidden",
    background: "#f8fafc",
  },
  image: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#ef4444",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  hoverActions: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "opacity 0.2s ease",
  },
  hoverBtn: {
    width: 32,
    height: 32,
    background: "#fff",
    border: "none",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    color: "#64748b",
  },
  body: { padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  storeName: { fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" },
  name: { fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  ratingRow: { display: "flex", alignItems: "center", gap: 4 },
  stars: { color: "#f59e0b", fontSize: 13 },
  ratingCount: { color: "#94a3b8", fontSize: 11 },
  priceRow: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 },
  price: { fontSize: 17, fontWeight: 700, color: "#6366f1" },
  originalPrice: { fontSize: 13, color: "#94a3b8", textDecoration: "line-through" },
  stockBadge: { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, width: "fit-content" },
  cartBtn: {
    marginTop: 8,
    width: "100%",
    padding: "9px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    transition: "opacity 0.15s",
  },
};

export default ProductCard;
