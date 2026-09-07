import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    api.get("/vendor/analytics").then(r => setStats(r.data)).catch(() => {});
    api.get("/vendor/subscription").then(r => setSubscription(r.data)).catch(() => {});
  }, []);

  if (!user.isApproved) return (
    <div style={styles.pendingBox}>
      <h2>⏳ Account Pending Approval</h2>
      <p>Your vendor account is being reviewed by the admin. You'll be able to list products once approved.</p>
    </div>
  );

  return (
    <div>
      <h2>Vendor Dashboard — {user.name}</h2>
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><p style={styles.statNum}>৳{stats.totalRevenue}</p><p style={styles.statLabel}>Total Revenue</p></div>
          <div style={styles.statCard}><p style={styles.statNum}>{stats.totalOrders}</p><p style={styles.statLabel}>Total Orders</p></div>
          <div style={styles.statCard}><p style={styles.statNum}>{stats.totalProducts}</p><p style={styles.statLabel}>My Products</p></div>
          <div style={{...styles.statCard, background: subscription?.plan==="premium"?"#fff8e1":"#f3f4f6"}}>
            <p style={styles.statNum}>{subscription?.plan || "none"}</p>
            <p style={styles.statLabel}>Subscription Plan</p>
          </div>
        </div>
      )}
      <div style={styles.quickLinks}>
        <Link to="/vendor/products" style={styles.qLink}>📦 Manage Products</Link>
        <Link to="/vendor/orders" style={styles.qLink}>📋 View Orders</Link>
        <Link to="/vendor/analytics" style={styles.qLink}>📊 Analytics</Link>
        <Link to="/vendor/subscription" style={styles.qLink}>⭐ Subscription</Link>
        <Link to="/chat" style={styles.qLink}>💬 Messages</Link>
      </div>
    </div>
  );
};

const styles = {
  pendingBox: { background:"#fff8e1", border:"1px solid #ffe082", borderRadius:10, padding:32, textAlign:"center" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16, marginBottom:24 },
  statCard: { background:"#fff", borderRadius:8, padding:"16px 20px", textAlign:"center", border:"1px solid #e0e0e0" },
  statNum: { fontSize:26, fontWeight:700, color:"#1976d2", margin:0 },
  statLabel: { color:"#888", fontSize:13, margin:"4px 0 0" },
  quickLinks: { display:"flex", gap:12, flexWrap:"wrap" },
  qLink: { background:"#fff", border:"1px solid #e0e0e0", borderRadius:8, padding:"12px 20px", textDecoration:"none", color:"#333", fontWeight:600, fontSize:14 },
};

export default VendorDashboard;
