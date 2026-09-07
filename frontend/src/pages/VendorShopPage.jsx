import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const VendorShopPage = () => {
  const { vendorId } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await api.get(`/products/shop/${vendorId}`);
        setVendor(data.vendor);
        setProducts(data.products);
      } catch {
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [vendorId]);

  const addToCart = async (productId) => {
    if (!user) { navigate("/register"); return; }
    try {
      await api.post("/cart", { productId, quantity: 1 });
      refreshCart();
      alert("Added to cart!");
    } catch (err) { alert(err.response?.data?.message); }
  };

  const messageVendor = () => {
    if (!user) { navigate("/register"); return; }
    navigate("/chat");
  };

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{color:"#94a3b8",marginTop:12}}>Loading shop...</p>
    </div>
  );

  if (!vendor) return (
    <div style={styles.center}>
      <p style={{color:"#94a3b8"}}>Vendor shop not found.</p>
      <Link to="/products" style={styles.backLink}>← Browse Products</Link>
    </div>
  );

  return (
    <div style={{display:"flex", flexDirection:"column", gap:24}}>
      {/* Vendor Banner */}
      <div style={styles.banner}>
        <div style={styles.avatarWrap}>
          {vendor.profilePicture
            ? <img src={vendor.profilePicture} alt={vendor.name} style={styles.avatarImg} />
            : <div style={styles.avatarInitial}>{(vendor.storeName || vendor.name)?.charAt(0)?.toUpperCase()}</div>
          }
        </div>
        <div style={styles.vendorInfo}>
          <h1 style={styles.storeName}>{vendor.storeName || vendor.name}</h1>
          <p style={styles.vendorName}>by {vendor.name}</p>
          {vendor.storeDescription && <p style={styles.storeDesc}>{vendor.storeDescription}</p>}
          <div style={styles.bannerActions}>
            <span style={styles.productCount}>{products.length} Products</span>
            <button onClick={messageVendor} style={styles.msgBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 style={styles.sectionTitle}>Products from this Vendor</h2>
        {products.length === 0 ? (
          <p style={{color:"#94a3b8",textAlign:"center",padding:40}}>No products available yet.</p>
        ) : (
          <div style={styles.grid}>
            {products.map(p => {
              const displayPrice = p.discountedPrice || p.price;
              const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
              return (
                <div key={p._id} style={styles.card}>
                  <Link to={`/products/${p._id}`}>
                    <img
                      src={p.images?.[0] || "https://placehold.co/240x160?text=No+Image"}
                      alt={p.name}
                      style={styles.cardImg}
                    />
                  </Link>
                  <div style={styles.cardBody}>
                    <Link to={`/products/${p._id}`} style={styles.cardName}>{p.name}</Link>
                    <div style={styles.priceRow}>
                      <span style={styles.price}>৳ {displayPrice}</span>
                      {hasDiscount && <span style={styles.oldPrice}>৳ {p.price}</span>}
                    </div>
                    <span style={{
                      ...styles.badge,
                      background: p.stockStatus==="in-stock"?"#d1fae5":p.stockStatus==="low-stock"?"#fef3c7":"#fee2e2",
                      color: p.stockStatus==="in-stock"?"#065f46":p.stockStatus==="low-stock"?"#92400e":"#991b1b",
                    }}>
                      {p.stockStatus}
                    </span>
                    <button
                      onClick={() => addToCart(p._id)}
                      disabled={p.stockStatus === "out-of-stock"}
                      style={{...styles.addCartBtn, opacity: p.stockStatus==="out-of-stock"?0.5:1}}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  center: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:12 },
  spinner: { width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
  backLink: { color:"#6366f1", fontWeight:600, textDecoration:"none" },
  banner: { background:"linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", borderRadius:16, padding:"32px 28px", display:"flex", alignItems:"center", gap:24, color:"#fff" },
  avatarWrap: { flexShrink:0 },
  avatarImg: { width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(255,255,255,0.4)" },
  avatarInitial: { width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, fontWeight:800, color:"#fff", border:"3px solid rgba(255,255,255,0.4)" },
  vendorInfo: { flex:1 },
  storeName: { fontSize:26, fontWeight:800, margin:"0 0 4px", color:"#fff" },
  vendorName: { fontSize:14, margin:"0 0 8px", color:"rgba(255,255,255,0.8)" },
  storeDesc: { fontSize:14, margin:"0 0 12px", color:"rgba(255,255,255,0.85)", lineHeight:1.5, maxWidth:500 },
  bannerActions: { display:"flex", alignItems:"center", gap:12 },
  productCount: { fontSize:13, background:"rgba(255,255,255,0.2)", padding:"4px 12px", borderRadius:20, fontWeight:600 },
  msgBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#fff", color:"#4f46e5", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
  sectionTitle: { fontSize:20, fontWeight:800, color:"#1e293b", margin:"0 0 16px" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:20 },
  card: { background:"#fff", borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column" },
  cardImg: { width:"100%", height:160, objectFit:"cover", display:"block" },
  cardBody: { padding:14, display:"flex", flexDirection:"column", gap:6, flex:1 },
  cardName: { fontWeight:600, fontSize:14, color:"#1e293b", textDecoration:"none", lineHeight:1.4 },
  priceRow: { display:"flex", alignItems:"baseline", gap:8 },
  price: { fontWeight:800, fontSize:16, color:"#6366f1" },
  oldPrice: { fontSize:13, textDecoration:"line-through", color:"#94a3b8" },
  badge: { display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, width:"fit-content" },
  addCartBtn: { marginTop:"auto", padding:"8px 0", background:"linear-gradient(135deg, #6366f1, #4f46e5)", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
};

export default VendorShopPage;
