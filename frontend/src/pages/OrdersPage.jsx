import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [refundMap, setRefundMap] = useState({}); // orderId → refund object

  useEffect(() => {
    fetchOrders();
    fetchRefunds();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/myorders");
      setOrders(data);
    } catch {}
  };

  const fetchRefunds = async () => {
    try {
      const { data } = await api.get("/refunds/myrefunds");
      // Build a map: orderId → refund so we can look up fast per order card
      const map = {};
      data.forEach(r => {
        if (r.order?._id) map[r.order._id] = r;
      });
      setRefundMap(map);
    } catch {}
  };

  const statusColors = {
    pending: "#ff9800",
    processing: "#2196f3",
    shipped: "#9c27b0",
    delivered: "#4caf50",
    cancelled: "#e53935",
  };

  const refundBanner = (orderId) => {
    const refund = refundMap[orderId];
    if (!refund || refund.status === "pending") return null;

    if (refund.status === "approved") {
      return (
        <div style={styles.refundApproved}>
          <span style={styles.refundIcon}>✅</span>
          <div>
            <strong>Refund Approved!</strong>
            <p style={styles.refundMsg}>Your return/refund request for this order has been approved. Your refund is being processed.</p>
          </div>
        </div>
      );
    }

    if (refund.status === "rejected") {
      return (
        <div style={styles.refundRejected}>
          <span style={styles.refundIcon}>❌</span>
          <div>
            <strong>Refund Rejected</strong>
            <p style={styles.refundMsg}>Your return/refund request for this order was rejected by admin. Contact support if you need help.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Orders</h2>

      {orders.length === 0 && (
        <p style={{ color: "#888" }}>
          You haven't placed any orders yet. <a href="/products">Shop now</a>
        </p>
      )}

      {orders.map(order => (
        <div key={order._id} style={styles.orderCard}>
          {/* Refund status notification banner */}
          {refundBanner(order._id)}

          <div style={styles.orderTop}>
            <div>
              <p style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
              <p style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div style={styles.orderRight}>
              <span style={{ ...styles.statusBadge, background: statusColors[order.orderStatus] }}>
                {order.orderStatus}
              </span>
              <span style={styles.totalPrice}>৳ {order.finalPrice}</span>
            </div>
          </div>

          <div style={styles.itemList}>
            {order.items?.slice(0, 3).map(item => (
              <div key={item._id} style={styles.itemRow}>
                <img
                  src={item.product?.images?.[0] || "https://via.placeholder.com/40"}
                  alt=""
                  style={styles.itemImg}
                />
                <span style={{ fontSize: 13 }}>{item.product?.name} × {item.quantity}</span>
              </div>
            ))}
            {order.items?.length > 3 && (
              <p style={{ fontSize: 12, color: "#888" }}>+{order.items.length - 3} more items</p>
            )}
          </div>

          <div style={styles.orderActions}>
            {/* Show pending refund pill */}
            {refundMap[order._id]?.status === "pending" && (
              <span style={styles.pendingBadge}>⏳ Refund Pending</span>
            )}
            <Link to={`/orders/${order._id}`} style={styles.viewBtn}>View Details</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { background: "#fff", borderRadius: 10, padding: 24, maxWidth: 800, margin: "0 auto" },
  heading: { fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 20 },
  orderCard: { border: "1px solid #e0e0e0", borderRadius: 10, marginBottom: 16, overflow: "hidden" },
  orderTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px" },
  orderId: { fontWeight: 700, margin: 0, fontSize: 15 },
  orderDate: { color: "#888", fontSize: 12, margin: 0 },
  orderRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 },
  statusBadge: { color: "#fff", padding: "3px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600 },
  totalPrice: { fontWeight: 700, color: "#e53935", fontSize: 15 },
  itemList: { display: "flex", gap: 8, flexWrap: "wrap", padding: "0 16px 10px" },
  itemRow: { display: "flex", alignItems: "center", gap: 6, background: "#f9f9f9", borderRadius: 4, padding: "4px 8px" },
  itemImg: { width: 36, height: 36, objectFit: "cover", borderRadius: 4 },
  orderActions: { display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center", padding: "10px 16px", borderTop: "1px solid #f0f0f0" },
  viewBtn: { background: "#1976d2", color: "#fff", padding: "7px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 600, fontSize: 13 },
  pendingBadge: { background: "#fff8e1", color: "#f59e0b", border: "1px solid #fcd34d", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  // Refund banners
  refundApproved: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#f0fdf4", borderLeft: "4px solid #22c55e",
    padding: "12px 16px", color: "#166534",
  },
  refundRejected: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#fef2f2", borderLeft: "4px solid #ef4444",
    padding: "12px 16px", color: "#991b1b",
  },
  refundIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  refundMsg: { margin: "3px 0 0", fontSize: 13, fontWeight: 400, opacity: 0.9 },
};

export default OrdersPage;
