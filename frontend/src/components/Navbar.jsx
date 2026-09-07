import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>N</span>
          <span>Nova<span style={styles.brandAccent}>Mart</span></span>
        </Link>

        {/* Center links */}
        <div style={styles.links}>
          <Link to="/products" style={{...styles.link, ...(isActive("/products") ? styles.linkActive : {})}}>Products</Link>
          <Link to="/blogs" style={{...styles.link, ...(isActive("/blogs") ? styles.linkActive : {})}}>Blog</Link>

          {user?.role === "vendor" && (
            <>
              <Link to="/vendor/dashboard" style={{...styles.link, ...(location.pathname.startsWith("/vendor") ? styles.linkActive : {})}}>Dashboard</Link>
              <Link to="/vendor/products" style={styles.link}>My Products</Link>
              <Link to="/vendor/orders" style={styles.link}>Orders</Link>
              <Link to="/vendor/analytics" style={styles.link}>Analytics</Link>
              <Link to="/chat" style={{...styles.link, ...(isActive("/chat") ? styles.linkActive : {})}}>Messages</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin/dashboard" style={{...styles.link, ...(location.pathname.startsWith("/admin") ? styles.linkActive : {})}}>Admin Panel</Link>
          )}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user?.role === "customer" && (
            <>
              <Link to="/chat" style={styles.iconBtn} title="Chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </Link>
              <Link to="/wishlist" style={styles.wishlistBtn} title="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wishlistCount > 0 && <span style={styles.wishlistBadge}>{wishlistCount}</span>}
              </Link>
              <Link to="/orders" style={styles.iconBtn} title="My Orders">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              </Link>
              <Link to="/cart" style={styles.cartBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
              </Link>
            </>
          )}

          {user ? (
            <div style={styles.userGroup}>
              <Link to="/profile" style={styles.avatar} title={user.name}>
                {user.name?.charAt(0).toUpperCase()}
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          ) : (
            <div style={styles.authGroup}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 60,
    maxWidth: 1200,
    margin: "0 auto",
    gap: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    fontWeight: 800,
    color: "#1e293b",
    textDecoration: "none",
    letterSpacing: "-0.5px",
    flexShrink: 0,
  },
  brandIcon: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
  },
  brandAccent: { color: "#6366f1" },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
    paddingLeft: 16,
  },
  link: {
    padding: "6px 12px",
    borderRadius: 6,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.15s, background 0.15s",
  },
  linkActive: {
    color: "#6366f1",
    background: "#e0e7ff",
    fontWeight: 600,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: "#64748b",
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
    background: "transparent",
  },
  wishlistBtn: {
    position: "relative",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: "#64748b",
    textDecoration: "none",
    background: "transparent",
  },
  wishlistBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#f43f5e",
    color: "#fff",
    borderRadius: "50%",
    width: 17,
    height: 17,
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    position: "relative",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    color: "#6366f1",
    background: "#e0e7ff",
    textDecoration: "none",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: 17,
    height: 17,
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userGroup: { display: "flex", alignItems: "center", gap: 8 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoutBtn: {
    padding: "6px 14px",
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  authGroup: { display: "flex", alignItems: "center", gap: 8 },
  loginBtn: {
    padding: "6px 16px",
    color: "#6366f1",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: 6,
    border: "1.5px solid #6366f1",
    transition: "background 0.15s",
  },
  registerBtn: {
    padding: "6px 16px",
    background: "#6366f1",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    borderRadius: 6,
    transition: "background 0.15s",
  },
};

export default Navbar;
