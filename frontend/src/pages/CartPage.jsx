import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    const { data } = await api.get("/cart");
    setCart(data);
  };

  const updateQty = async (productId, qty) => {
    await api.put(`/cart/${productId}`, { quantity: qty });
    fetchCart(); refreshCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    fetchCart(); refreshCart();
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/register");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div style={styles.container}>
      <h2>Your Cart ({cart.items?.length} items)</h2>
      {cart.items?.length === 0 && <p style={{color:"#888"}}>Your cart is empty. <a href="/products">Shop now</a></p>}

      {cart.items?.map(item => (
        <div key={item._id} style={styles.cartItem}>
          <img src={item.product?.images?.[0] || "https://via.placeholder.com/80"} alt={item.product?.name} style={styles.itemImg} />
          <div style={styles.itemInfo}>
            <p style={styles.itemName}>{item.product?.name}</p>
            <p style={styles.itemPrice}>৳ {item.product?.discountedPrice || item.product?.price}</p>
            <span style={{fontSize:12, color: item.product?.stockStatus==="in-stock"?"green":"orange"}}>{item.product?.stockStatus}</span>
          </div>
          <div style={styles.qtyControl}>
            <button style={styles.qtyBtn} onClick={() => updateQty(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
            <span style={styles.qty}>{item.quantity}</span>
            <button style={styles.qtyBtn} onClick={() => updateQty(item.product._id, item.quantity + 1)}>+</button>
          </div>
          <p style={styles.lineTotal}>৳ {((item.product?.discountedPrice || item.product?.price) * item.quantity).toFixed(2)}</p>
          <button onClick={() => removeItem(item.product._id)} style={styles.removeBtn}>✕</button>
        </div>
      ))}

      {cart.items?.length > 0 && (
        <div style={styles.summary}>
          <div>
            <h3 style={{margin:0}}>Subtotal: <span style={{color:"#e53935"}}>৳ {cart.totalPrice}</span></h3>
            <p style={{margin:"4px 0 0",fontSize:13,color:"#888"}}>+ ৳ 100 delivery charge applies for Home Delivery</p>
          </div>
          <button onClick={handleCheckout} style={styles.checkoutBtn}>Proceed to Checkout →</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24, maxWidth:800, margin:"0 auto" },
  cartItem: { display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:"1px solid #eee" },
  itemImg: { width:80, height:80, objectFit:"cover", borderRadius:6 },
  itemInfo: { flex:1 },
  itemName: { fontWeight:600, margin:0, marginBottom:4 },
  itemPrice: { color:"#e53935", fontWeight:700, margin:0 },
  qtyControl: { display:"flex", alignItems:"center", gap:8 },
  qtyBtn: { width:28, height:28, background:"#e0e0e0", border:"none", borderRadius:4, cursor:"pointer", fontWeight:700, fontSize:15 },
  qty: { fontWeight:700, minWidth:24, textAlign:"center" },
  lineTotal: { fontWeight:700, minWidth:60, textAlign:"right" },
  removeBtn: { background:"#ffebee", color:"#e53935", border:"none", borderRadius:4, padding:"4px 8px", cursor:"pointer", fontWeight:700 },
  summary: { display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16 },
  checkoutBtn: { background:"#1976d2", color:"#fff", border:"none", padding:"12px 28px", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:15 },
};

export default CartPage;
