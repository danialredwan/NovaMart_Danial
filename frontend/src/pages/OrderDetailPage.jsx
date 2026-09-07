import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [refund, setRefund] = useState(null);   // refund for this order (if any)
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    fetchOrder();
    fetchMyRefund();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch {}
  };

  const fetchMyRefund = async () => {
    try {
      const { data } = await api.get("/refunds/myrefunds");
      const match = data.find(r => r.order?._id === id || r.order === id);
      setRefund(match || null);
    } catch {}
  };

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data.order);
    } catch (err) { alert(err.response?.data?.message); }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    try {
      await api.post("/refunds", { orderId: id, reason: refundReason });
      alert("Refund request submitted!");
      fetchMyRefund();
    } catch (err) { alert(err.response?.data?.message); }
  };

  if (!order) return <p style={{ textAlign: "center", padding: 40 }}>Loading...</p>;

  const statusSteps = ["pending", "processing", "shipped", "delivered"];
  const currentStep = statusSteps.indexOf(order.orderStatus);

  // ── Refund status banner ────────────────────────────────────────────────
  const RefundStatusBanner = () => {
    if (!refund) return null;

    if (refund.status === "pending") return (
      <div style={bannerStyles.pending}>
        <span style={bannerStyles.icon}>⏳</span>
        <div>
          <strong>Refund Request Pending</strong>
          <p style={bannerStyles.msg}>
            Your refund request has been submitted and is awaiting admin review.
            <br />
            <em style={{ fontSize: 12, opacity: 0.8 }}>Reason: "{refund.reason}"</em>
          </p>
        </div>
      </div>
    );

    if (refund.status === "approved") return (
      <div style={bannerStyles.approved}>
        <span style={bannerStyles.icon}>✅</span>
        <div>
          <strong>Refund Approved!</strong>
          <p style={bannerStyles.msg}>
            Great news! Your return/refund request has been <strong>approved</strong> by admin.
            Your refund is being processed. Please allow 3–5 business days.
            <br />
            <em style={{ fontSize: 12, opacity: 0.8 }}>Approved on: {new Date(refund.updatedAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</em>
          </p>
        </div>
      </div>
    );

    if (refund.status === "rejected") return (
      <div style={bannerStyles.rejected}>
        <span style={bannerStyles.icon}>❌</span>
        <div>
          <strong>Refund Request Rejected</strong>
          <p style={bannerStyles.msg}>
            Unfortunately your return/refund request has been <strong>rejected</strong> by admin.
            If you believe this is a mistake, please contact our support team.
            <br />
            <em style={{ fontSize: 12, opacity: 0.8 }}>Rejected on: {new Date(refund.updatedAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</em>
          </p>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Order Details</h2>
      <p style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>
        Placed on {new Date(order.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      {/* Refund notification banner — shown prominently at top */}
      <RefundStatusBanner />

      {/* Order tracking progress bar */}
      {order.orderStatus !== "cancelled" && (
        <div style={styles.trackingBar}>
          {statusSteps.map((step, i) => (
            <div key={step} style={styles.stepWrapper}>
              <div style={{ ...styles.stepCircle, background: i <= currentStep ? "#1976d2" : "#e0e0e0", color: i <= currentStep ? "#fff" : "#999" }}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span style={{ ...styles.stepLabel, color: i <= currentStep ? "#1976d2" : "#aaa" }}>{step}</span>
              {i < statusSteps.length - 1 && (
                <div style={{ ...styles.stepLine, background: i < currentStep ? "#1976d2" : "#e0e0e0" }} />
              )}
            </div>
          ))}
        </div>
      )}
      {order.orderStatus === "cancelled" && (
        <p style={{ background: "#ffebee", color: "#e53935", padding: "8px 16px", borderRadius: 6, fontWeight: 600, marginBottom: 16 }}>
          This order was cancelled
        </p>
      )}

      {order.trackingNote && (
        <p style={styles.trackingNote}>📦 {order.trackingNote}</p>
      )}

      {/* Items */}
      <h3 style={styles.sectionTitle}>Items</h3>
      {order.items?.map(item => (
        <div key={item._id} style={styles.itemRow}>
          <img src={item.product?.images?.[0] || "https://via.placeholder.com/60"} alt="" style={styles.img} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{item.product?.name}</p>
            <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Vendor: {item.vendor?.storeName || item.vendor?.name}</p>
          </div>
          <span style={{ fontWeight: 600 }}>{item.quantity} × ৳ {item.price} = <b>৳ {(item.quantity * item.price).toFixed(2)}</b></span>
        </div>
      ))}

      {/* Price Summary */}
      <div style={styles.priceSummary}>
        <div style={styles.priceRow}><span>Subtotal</span><span>৳ {order.totalPrice}</span></div>
        {order.couponDiscount > 0 && (
          <div style={{ ...styles.priceRow, color: "green" }}><span>Coupon Discount</span><span>−৳ {order.couponDiscount}</span></div>
        )}
        {order.deliveryCharge > 0 && (
          <div style={{ ...styles.priceRow, color: "#e53935" }}><span>Delivery Charge</span><span>+৳ {order.deliveryCharge}</span></div>
        )}
        <div style={{ ...styles.priceRow, fontWeight: 700, fontSize: 16 }}>
          <span>Final Total</span>
          <span style={{ color: "#e53935" }}>৳ {order.finalPrice}</span>
        </div>
        <div style={styles.priceRow}><span>Payment</span><span>{order.paymentMethod} ({order.paymentStatus})</span></div>
        <div style={styles.priceRow}><span>Delivery</span><span>{order.deliveryOption}</span></div>
        {order.shippingAddress && <div style={styles.priceRow}><span>Address</span><span>{order.shippingAddress}</span></div>}
      </div>

      {/* Actions */}
      <div style={styles.actionsRow}>
        {["pending", "processing"].includes(order.orderStatus) && (
          <button onClick={cancelOrder} style={styles.cancelBtn}>Cancel Order</button>
        )}

        {/* Show refund form only if delivered AND no refund submitted yet */}
        {order.orderStatus === "delivered" && !refund && (
          <form onSubmit={submitRefund} style={styles.refundForm}>
            <h4 style={{ margin: "0 0 10px", color: "#b45309" }}>🔄 Request Refund / Return</h4>
            <textarea
              style={styles.textarea}
              required
              placeholder="Explain your reason for return or refund..."
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
            />
            <button type="submit" style={styles.refundBtn}>Submit Refund Request</button>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Refund banner styles ─────────────────────────────────────────────────────
const bannerStyles = {
  pending: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#fffbeb", border: "1px solid #fcd34d", borderLeft: "4px solid #f59e0b",
    borderRadius: 8, padding: "14px 16px", marginBottom: 16, color: "#92400e",
  },
  approved: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#f0fdf4", border: "1px solid #86efac", borderLeft: "4px solid #22c55e",
    borderRadius: 8, padding: "14px 16px", marginBottom: 16, color: "#166534",
  },
  rejected: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#fef2f2", border: "1px solid #fca5a5", borderLeft: "4px solid #ef4444",
    borderRadius: 8, padding: "14px 16px", marginBottom: 16, color: "#991b1b",
  },
  icon: { fontSize: 22, flexShrink: 0, marginTop: 1 },
  msg: { margin: "4px 0 0", fontSize: 13, lineHeight: 1.6 },
};

const styles = {
  container: { background: "#fff", borderRadius: 10, padding: 24, maxWidth: 760, margin: "0 auto" },
  pageTitle: { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" },
  orderId: { fontWeight: 700, fontSize: 18, margin: "0 0 4px" },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "20px 0 10px" },
  trackingBar: { display: "flex", alignItems: "center", margin: "20px 0", flexWrap: "wrap" },
  stepWrapper: { display: "flex", alignItems: "center", gap: 4 },
  stepCircle: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 },
  stepLabel: { fontSize: 11, fontWeight: 600, textTransform: "capitalize" },
  stepLine: { width: 40, height: 3, borderRadius: 2, margin: "0 4px" },
  trackingNote: { background: "#e3f2fd", color: "#1565c0", borderRadius: 6, padding: "8px 14px", marginBottom: 12, fontSize: 14 },
  itemRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" },
  img: { width: 60, height: 60, objectFit: "cover", borderRadius: 6 },
  priceSummary: { background: "#f9f9f9", borderRadius: 8, padding: "14px 16px", marginTop: 16 },
  priceRow: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 },
  actionsRow: { marginTop: 16 },
  cancelBtn: { background: "#e53935", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
  refundForm: { background: "#fff8e1", borderRadius: 8, padding: 16, marginTop: 10, border: "1px solid #fde68a" },
  textarea: { width: "100%", height: 80, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box", marginBottom: 10, resize: "vertical" },
  refundBtn: { background: "#f59e0b", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600 },
};

export default OrderDetailPage;
