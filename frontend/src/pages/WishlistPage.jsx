import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const { refreshCart, refreshWishlist } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    const { data } = await api.get("/wishlist");
    setWishlist(data.products || []);
  };

  const removeFromWishlist = async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    fetchWishlist();
    refreshWishlist();
  };

  const moveToCart = async (productId) => {
    if (!user) { navigate("/register"); return; }
    try {
      await api.post("/cart", { productId, quantity: 1 });
      await api.delete(`/wishlist/${productId}`);
      refreshCart();
      refreshWishlist();
      fetchWishlist();
      alert("Moved to cart!");
    } catch (err) { alert(err.response?.data?.message); }
  };

  return (
    <div style={styles.container}>
      <h2>My Wishlist ({wishlist.length} items)</h2>
      {wishlist.length === 0 && <p style={{color:"#888"}}>Your wishlist is empty. <a href="/products">Browse products</a></p>}
      <div style={styles.grid}>
        {wishlist.map(product => (
          <div key={product._id} style={styles.card}>
            <img src={product.images?.[0]||"https://via.placeholder.com/160"} alt={product.name} style={styles.img} />
            <div style={styles.info}>
              <p style={styles.name}>{product.name}</p>
              <p style={styles.price}>৳ {product.discountedPrice||product.price}</p>
              <span style={{...styles.badge, background: product.stockStatus==="in-stock"?"#d4edda":"#fff3cd", color: product.stockStatus==="in-stock"?"#155724":"#856404"}}>{product.stockStatus}</span>
              <div style={styles.actions}>
                <button onClick={() => moveToCart(product._id)} style={styles.cartBtn} disabled={product.stockStatus==="out-of-stock"}>Move to Cart</button>
                <button onClick={() => removeFromWishlist(product._id)} style={styles.removeBtn}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24 },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginTop:16 },
  card: { border:"1px solid #e0e0e0", borderRadius:8, overflow:"hidden" },
  img: { width:"100%", height:160, objectFit:"cover" },
  info: { padding:12 },
  name: { fontWeight:600, margin:"0 0 4px", fontSize:14 },
  price: { color:"#e53935", fontWeight:700, margin:"0 0 6px" },
  badge: { display:"inline-block", padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600 },
  actions: { display:"flex", gap:8, marginTop:10 },
  cartBtn: { flex:1, background:"#1976d2", color:"#fff", border:"none", borderRadius:6, padding:"7px 0", cursor:"pointer", fontWeight:600, fontSize:13 },
  removeBtn: { background:"#ffebee", color:"#e53935", border:"none", borderRadius:6, padding:"7px 12px", cursor:"pointer", fontWeight:600, fontSize:13 },
};

export default WishlistPage;
