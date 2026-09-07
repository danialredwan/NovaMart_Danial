import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useCart } from "../context/CartContext";

const DELIVERY_CHARGE = 100; // BDT

const CheckoutPage = () => {
  const [cart, setCart]           = useState({ items: [], totalPrice: 0 });
  const [profile, setProfile]     = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [form, setForm]           = useState({ paymentMethod: "COD", deliveryOption: "delivery", shippingAddress: "" });
  const { refreshCart }           = useCart();
  const navigate                  = useNavigate();

  useEffect(() => {
    api.get("/cart").then(r => setCart(r.data));
    api.get("/auth/profile").then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const loyaltyPoints    = profile?.loyaltyPoints || 0;
  const freeDelivery     = loyaltyPoints >= 300000;
  const loyaltyDiscount15 = loyaltyPoints >= 500000;

  const validateCoupon = async () => {
    try {
      const { data } = await api.post("/discounts/validate", { code: couponCode, cartTotal: cart.totalPrice });
      setCouponInfo(data);
    } catch (err) { alert(err.response?.data?.message); }
  };

  const placeOrder = async () => {
    if (!form.shippingAddress && form.deliveryOption === "delivery")
      return alert("Please enter a shipping address");
    try {
      await api.post("/orders", { ...form, couponCode });
      refreshCart();
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) { alert(err.response?.data?.message); }
  };

  const subtotal       = parseFloat(cart.totalPrice) || 0;
  const couponOff      = couponInfo ? parseFloat(couponInfo.discountAmount) : 0;
  const afterCoupon    = Math.max(0, subtotal - couponOff);
  const loyaltyOff     = loyaltyDiscount15 ? parseFloat((afterCoupon * 0.15).toFixed(2)) : 0;
  const delivery       = (form.deliveryOption === "delivery" && !freeDelivery) ? DELIVERY_CHARGE : 0;
  const finalPrice     = Math.max(0, afterCoupon - loyaltyOff + delivery).toFixed(2);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Checkout</h2>

      {/* Loyalty benefit banners */}
      {freeDelivery && (
        <div style={styles.loyaltyBanner}>
          🎁 <strong>Silver Member Perk:</strong> Free delivery applied on this order! (300,000+ points)
        </div>
      )}
      {loyaltyDiscount15 && (
        <div style={{ ...styles.loyaltyBanner, background: "#fef9c3", borderColor: "#fde047", color: "#713f12" }}>
          👑 <strong>Gold Member Perk:</strong> Extra 15% loyalty discount applied! (500,000+ points)
        </div>
      )}

      <div style={styles.layout}>
        {/* Left: Form */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Delivery</h3>
          <label style={styles.label}>Delivery Option</label>
          <select style={styles.input} value={form.deliveryOption} onChange={e => setForm({ ...form, deliveryOption: e.target.value })}>
            <option value="delivery">Home Delivery {freeDelivery ? "(FREE — Loyalty Reward)" : "(+৳ 100)"}</option>
            <option value="pickup">Store Pickup (Free)</option>
          </select>

          {form.deliveryOption === "delivery" && (
            <>
              <label style={styles.label}>Shipping Address</label>
              <textarea style={{ ...styles.input, height: 70 }} placeholder="Enter your full address"
                value={form.shippingAddress} onChange={e => setForm({ ...form, shippingAddress: e.target.value })} />
            </>
          )}

          <h3 style={styles.sectionTitle}>Payment</h3>
          <select style={styles.input} value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="card">Credit / Debit Card</option>
            <option value="online">Online Banking</option>
          </select>

          <h3 style={styles.sectionTitle}>Coupon Code</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...styles.input, flex: 1, marginBottom: 0 }} placeholder="Enter coupon code"
              value={couponCode} onChange={e => setCouponCode(e.target.value)} />
            <button onClick={validateCoupon} style={styles.couponBtn}>Apply</button>
          </div>
          {couponInfo && <p style={{ color: "green", marginTop: 6, fontSize: 13 }}>✓ {couponInfo.message} — You save ৳ {couponInfo.discountAmount}</p>}
        </div>

        {/* Right: Order Summary */}
        <div style={styles.summary}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>Order Summary</h3>
          {cart.items?.map(item => (
            <div key={item._id} style={styles.summaryItem}>
              <span>{item.product?.name} × {item.quantity}</span>
              <span>৳ {((item.product?.discountedPrice || item.product?.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />

          <div style={styles.summaryItem}><span>Subtotal</span><span>৳ {subtotal.toFixed(2)}</span></div>

          {couponInfo && (
            <div style={{ ...styles.summaryItem, color: "#16a34a" }}>
              <span>Coupon Discount</span><span>−৳ {couponOff.toFixed(2)}</span>
            </div>
          )}
          {loyaltyOff > 0 && (
            <div style={{ ...styles.summaryItem, color: "#d97706" }}>
              <span>👑 Loyalty Discount (15%)</span><span>−৳ {loyaltyOff.toFixed(2)}</span>
            </div>
          )}
          {delivery > 0 && (
            <div style={{ ...styles.summaryItem, color: "#e53935" }}>
              <span>Delivery Charge</span><span>+৳ {delivery}</span>
            </div>
          )}
          {delivery === 0 && form.deliveryOption === "delivery" && (
            <div style={{ ...styles.summaryItem, color: "#16a34a" }}>
              <span>Delivery Charge</span><span>FREE 🎁</span>
            </div>
          )}
          {form.deliveryOption === "pickup" && (
            <div style={{ ...styles.summaryItem, color: "#16a34a" }}>
              <span>Store Pickup</span><span>Free</span>
            </div>
          )}

          <div style={{ ...styles.summaryItem, fontWeight: 700, fontSize: 17, marginTop: 6 }}>
            <span>Total</span>
            <span style={{ color: "#e53935" }}>৳ {finalPrice}</span>
          </div>

          {/* Loyalty points info */}
          {profile?.role === "customer" && (
            <div style={styles.pointsInfo}>
              ⭐ You have <strong>{loyaltyPoints.toLocaleString()}</strong> loyalty points
              {!freeDelivery && <p style={styles.pointsHint}>Earn {(300000 - loyaltyPoints).toLocaleString()} more for <strong>Free Delivery</strong></p>}
              {freeDelivery && !loyaltyDiscount15 && <p style={styles.pointsHint}>Earn {(500000 - loyaltyPoints).toLocaleString()} more for <strong>15% Off</strong></p>}
              {loyaltyDiscount15 && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#d97706" }}>👑 You have all loyalty rewards unlocked!</p>}
            </div>
          )}

          <button onClick={placeOrder} style={styles.placeBtn}>Place Order</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:    { background: "#fff", borderRadius: 10, padding: 24, maxWidth: 900, margin: "0 auto" },
  heading:      { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 16px" },
  loyaltyBanner:{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#166534" },
  layout:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 8 },
  formSection:  {},
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "14px 0 8px" },
  label:        { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "#555" },
  input:        { width: "100%", padding: "9px 12px", marginBottom: 12, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  couponBtn:    { padding: "9px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  summary:      { background: "#f9fafb", borderRadius: 10, padding: 20, alignSelf: "flex-start", border: "1px solid #e5e7eb" },
  summaryItem:  { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 },
  pointsInfo:   { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", margin: "12px 0", fontSize: 13, color: "#92400e" },
  pointsHint:   { margin: "4px 0 0", fontSize: 11, color: "#78716c" },
  placeBtn:     { width: "100%", marginTop: 12, padding: 14, background: "#e53935", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15 },
};

export default CheckoutPage;
