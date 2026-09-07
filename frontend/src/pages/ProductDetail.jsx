import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
    if (data.category?._id) {
      const res = await api.get(`/products?category=${data.category._id}`);
      setRecommended(res.data.filter(p => p._id !== id).slice(0, 4));
    }
  };

  const fetchReviews = async () => {
    const { data } = await api.get(`/reviews/${id}`);
    setReviews(data);
  };

  const addToCart = async () => {
    if (!user) { navigate("/register"); return; }
    setAddingToCart(true);
    try {
      await api.post("/cart", { productId: id, quantity: qty });
      refreshCart();
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) { navigate("/register"); return; }
    try {
      await api.post(`/wishlist/${id}`);
      alert("Added to wishlist!");
    } catch (err) { alert(err.response?.data?.message); }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this product: ${product?.name} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Product link copied!");
  };

  const messageVendor = () => {
    if (!user) { navigate("/register"); return; }
    navigate("/chat", {
      state: {
        withUser: {
          _id: product.vendor?._id,
          name: product.vendor?.storeName || product.vendor?.name,
        },
      },
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      fetchReviews();
      fetchProduct();
    } catch (err) { alert(err.response?.data?.message); }
  };

  if (!product) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p style={{color:"#94a3b8",marginTop:12}}>Loading product...</p>
    </div>
  );

  const price = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  const stockBg = { "in-stock": "#d1fae5", "low-stock": "#fef3c7", "out-of-stock": "#fee2e2" };
  const stockColor = { "in-stock": "#065f46", "low-stock": "#92400e", "out-of-stock": "#991b1b" };

  return (
    <div style={{display:"flex", flexDirection:"column", gap:32}}>

      {/* Main product section */}
      <div style={styles.productGrid}>
        {/* Left: Images */}
        <div style={styles.imageSection}>
          <div style={styles.mainImageWrap}>
            <img
              src={product.images?.[activeImage] || "https://placehold.co/500x400?text=No+Image"}
              alt={product.name}
              style={styles.mainImage}
            />
            {hasDiscount && <span style={styles.discountBadge}>-{discountPct}%</span>}
          </div>
          {product.images?.length > 1 && (
            <div style={styles.thumbnails}>
              {product.images.map((img, i) => (
                <img
                  key={i} src={img} alt=""
                  style={{...styles.thumb, borderColor: i === activeImage ? "#6366f1" : "#e2e8f0"}}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div style={styles.details}>
          {product.category && (
            <Link to={`/products?category=${product.category._id}`} style={styles.categoryLink}>
              {product.category.name}
            </Link>
          )}
          <h1 style={styles.name}>{product.name}</h1>

          {/* Clickable vendor name + message button */}
          <div style={styles.vendorRow}>
            <p style={{margin:0, fontSize:13, color:"#64748b"}}>
              Sold by{" "}
              <Link
                to={`/shop/${product.vendor?._id}`}
                style={styles.vendorLink}
              >
                {product.vendor?.storeName || product.vendor?.name}
              </Link>
            </p>
            <button onClick={messageVendor} style={styles.msgVendorBtn} title="Message Vendor">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message Vendor
            </button>
          </div>

          {/* Rating */}
          <div style={styles.ratingRow}>
            <span style={styles.stars}>{"★".repeat(Math.round(product.averageRating || 0))}{"☆".repeat(5 - Math.round(product.averageRating || 0))}</span>
            <span style={styles.ratingText}>{product.averageRating?.toFixed(1) || "0"}</span>
            <span style={styles.reviewCount}>({product.totalReviews || 0} reviews)</span>
          </div>

          {/* Price in BDT */}
          <div style={styles.priceRow}>
            <span style={styles.price}>৳ {price}</span>
            {hasDiscount && <span style={styles.oldPrice}>৳ {product.price}</span>}
            {hasDiscount && <span style={styles.saveBadge}>Save ৳ {(product.price - product.discountedPrice).toFixed(2)}</span>}
          </div>

          {/* Stock */}
          <span style={{...styles.stockBadge, background: stockBg[product.stockStatus] || "#f1f5f9", color: stockColor[product.stockStatus] || "#475569"}}>
            {product.stockStatus === "in-stock" ? "✓ In Stock" : product.stockStatus === "low-stock" ? "⚠ Low Stock" : "✗ Out of Stock"}
          </span>

          {/* Specs */}
          {(product.brand || product.color || product.size || product.material) && (
            <div style={styles.specsGrid}>
              {product.brand && <div style={styles.specItem}><span style={styles.specKey}>Brand</span><span style={styles.specVal}>{product.brand}</span></div>}
              {product.color && <div style={styles.specItem}><span style={styles.specKey}>Color</span><span style={styles.specVal}>{product.color}</span></div>}
              {product.size && <div style={styles.specItem}><span style={styles.specKey}>Size</span><span style={styles.specVal}>{product.size}</span></div>}
              {product.material && <div style={styles.specItem}><span style={styles.specKey}>Material</span><span style={styles.specVal}>{product.material}</span></div>}
            </div>
          )}

          {product.specifications && (
            <p style={styles.specsFull}><strong>Specifications:</strong> {product.specifications}</p>
          )}

          <p style={styles.description}>{product.description}</p>

          {/* Quantity + actions */}
          <div style={styles.actions}>
            <div style={styles.qtyRow}>
              <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
              <span style={styles.qty}>{qty}</span>
              <button style={styles.qtyBtn} onClick={() => setQty(q => q+1)}>+</button>
            </div>
            <button
              onClick={addToCart}
              disabled={addingToCart || product.stockStatus === "out-of-stock"}
              style={{
                ...styles.cartBtn,
                opacity: product.stockStatus === "out-of-stock" ? 0.5 : 1,
                cursor: product.stockStatus === "out-of-stock" ? "not-allowed" : "pointer",
              }}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          <div style={styles.secondaryActions}>
            <button onClick={addToWishlist} style={styles.wishBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Save to Wishlist
            </button>
          </div>

          {/* Social Share Buttons */}
          <div style={styles.shareRow}>
            <span style={styles.shareLabel}>Share:</span>
            <button onClick={shareOnFacebook} style={styles.fbBtn} title="Share on Facebook">
              {/* Facebook icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Facebook
            </button>
            <button onClick={shareOnWhatsApp} style={styles.waBtn} title="Share on WhatsApp">
              {/* WhatsApp icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button onClick={copyLink} style={styles.shareBtn} title="Copy link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {reviews.map(r => (
              <div key={r._id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewAvatar}>{r.user?.name?.charAt(0)}</div>
                  <div>
                    <p style={styles.reviewName}>{r.user?.name}</p>
                    <p style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString("en-US", {year:"numeric",month:"short",day:"numeric"})}</p>
                  </div>
                  <span style={styles.reviewStars}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                </div>
                <p style={styles.reviewComment}>{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{color:"#94a3b8",textAlign:"center",padding:24}}>No reviews yet. Be the first to review!</p>
        )}

        {user?.role === "customer" && (
          <div style={styles.writeReview}>
            <h3 style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:14}}>Write a Review</h3>
            <form onSubmit={submitReview} style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={styles.reviewLabel}>Rating</label>
                <select style={styles.reviewInput} value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)} — {n} Star{n>1?"s":""}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.reviewLabel}>Your Review</label>
                <textarea style={{...styles.reviewInput, height:90, resize:"vertical"}} placeholder="Share your experience with this product..." required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
              </div>
              <button type="submit" style={styles.submitBtn}>Submit Review</button>
            </form>
          </div>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>You May Also Like</h2>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16}}>
            {recommended.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} style={styles.recCard}>
                <img src={p.images?.[0]||"https://placehold.co/200x130?text=No+Image"} alt={p.name} style={styles.recImg}/>
                <div style={styles.recBody}>
                  <p style={styles.recName}>{p.name}</p>
                  <p style={styles.recPrice}>৳ {p.discountedPrice||p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loading: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300 },
  spinner: { width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.7s linear infinite" },
  productGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, background:"#fff", borderRadius:16, padding:28, border:"1px solid #e2e8f0", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
  imageSection: { display:"flex", flexDirection:"column", gap:12 },
  mainImageWrap: { position:"relative", borderRadius:12, overflow:"hidden", background:"#f8fafc", border:"1px solid #e2e8f0" },
  mainImage: { width:"100%", height:380, objectFit:"contain", display:"block" },
  discountBadge: { position:"absolute", top:12, left:12, background:"#ef4444", color:"#fff", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700 },
  thumbnails: { display:"flex", gap:8, flexWrap:"wrap" },
  thumb: { width:64, height:64, objectFit:"cover", borderRadius:8, cursor:"pointer", border:"2px solid", transition:"border-color 0.15s" },
  details: { display:"flex", flexDirection:"column", gap:12 },
  categoryLink: { fontSize:12, fontWeight:600, color:"#6366f1", background:"#e0e7ff", padding:"3px 10px", borderRadius:20, width:"fit-content", textDecoration:"none" },
  name: { fontSize:24, fontWeight:800, color:"#1e293b", margin:0, lineHeight:1.3 },
  vendorRow: { display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  vendorLink: { color:"#6366f1", fontWeight:700, textDecoration:"none" },
  msgVendorBtn: { display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:"#e0e7ff", color:"#4f46e5", border:"none", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600 },
  ratingRow: { display:"flex", alignItems:"center", gap:6 },
  stars: { color:"#f59e0b", fontSize:16 },
  ratingText: { fontSize:14, fontWeight:700, color:"#1e293b" },
  reviewCount: { fontSize:13, color:"#94a3b8" },
  priceRow: { display:"flex", alignItems:"baseline", gap:10 },
  price: { fontSize:30, fontWeight:800, color:"#1e293b" },
  oldPrice: { fontSize:16, textDecoration:"line-through", color:"#94a3b8" },
  saveBadge: { fontSize:12, fontWeight:600, color:"#065f46", background:"#d1fae5", padding:"2px 8px", borderRadius:20 },
  stockBadge: { display:"inline-block", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, width:"fit-content" },
  specsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:"#f8fafc", borderRadius:10, padding:"12px 16px", border:"1px solid #e2e8f0" },
  specItem: { display:"flex", flexDirection:"column", gap:2 },
  specKey: { fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase" },
  specVal: { fontSize:13, color:"#1e293b", fontWeight:600 },
  specsFull: { fontSize:13, color:"#475569", lineHeight:1.5, margin:0 },
  description: { fontSize:14, color:"#64748b", lineHeight:1.7, margin:0 },
  actions: { display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" },
  qtyRow: { display:"flex", alignItems:"center", gap:0, border:"1.5px solid #e2e8f0", borderRadius:10, overflow:"hidden" },
  qtyBtn: { width:36, height:40, background:"#f8fafc", border:"none", cursor:"pointer", fontSize:18, fontWeight:600, color:"#475569" },
  qty: { minWidth:40, textAlign:"center", fontSize:15, fontWeight:700, color:"#1e293b", padding:"0 8px" },
  cartBtn: { flex:1, padding:"11px 24px", background:"linear-gradient(135deg, #6366f1, #4f46e5)", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, transition:"opacity 0.15s", boxShadow:"0 4px 14px rgba(99,102,241,0.3)" },
  secondaryActions: { display:"flex", gap:10 },
  wishBtn: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 16px", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:10, color:"#64748b", cursor:"pointer", fontSize:13, fontWeight:600 },
  shareRow: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", paddingTop:4 },
  shareLabel: { fontSize:13, fontWeight:600, color:"#64748b" },
  fbBtn: { display:"flex", alignItems:"center", gap:5, padding:"7px 12px", background:"#1877f2", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 },
  waBtn: { display:"flex", alignItems:"center", gap:5, padding:"7px 12px", background:"#25d366", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 },
  shareBtn: { display:"flex", alignItems:"center", gap:5, padding:"7px 12px", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:8, color:"#64748b", cursor:"pointer", fontSize:13, fontWeight:600 },
  section: { background:"#fff", borderRadius:16, padding:24, border:"1px solid #e2e8f0" },
  sectionTitle: { fontSize:20, fontWeight:800, color:"#1e293b", margin:"0 0 16px" },
  reviewCard: { background:"#f8fafc", borderRadius:12, padding:"14px 16px", border:"1px solid #e2e8f0" },
  reviewHeader: { display:"flex", alignItems:"center", gap:10, marginBottom:8 },
  reviewAvatar: { width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, #6366f1, #4f46e5)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 },
  reviewName: { margin:0, fontWeight:700, fontSize:13, color:"#1e293b" },
  reviewDate: { margin:0, fontSize:11, color:"#94a3b8" },
  reviewStars: { marginLeft:"auto", color:"#f59e0b", fontSize:14 },
  reviewComment: { margin:0, fontSize:13, color:"#475569", lineHeight:1.6 },
  writeReview: { marginTop:24, background:"#f0f4ff", borderRadius:12, padding:20, border:"1px solid #e0e7ff" },
  reviewLabel: { display:"block", fontSize:12, fontWeight:700, color:"#475569", marginBottom:6 },
  reviewInput: { width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, background:"#fff", outline:"none", boxSizing:"border-box" },
  submitBtn: { padding:"10px 24px", background:"linear-gradient(135deg, #6366f1, #4f46e5)", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
  recCard: { textDecoration:"none", color:"#1e293b", background:"#fff", borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", transition:"box-shadow 0.18s" },
  recImg: { width:"100%", height:120, objectFit:"cover", display:"block" },
  recBody: { padding:"10px 12px" },
  recName: { margin:"0 0 4px", fontWeight:600, fontSize:13, color:"#1e293b" },
  recPrice: { margin:0, fontWeight:700, fontSize:14, color:"#6366f1" },
};

export default ProductDetail;
