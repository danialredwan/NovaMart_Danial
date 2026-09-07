import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {}); }, []);

  const navItems = [
    { label:"👥 Users", path:"/admin/users", desc:"Manage users & approve vendors" },
    { label:"📦 Orders", path:"/admin/orders", desc:"View and manage all orders" },
    { label:"🏷️ Categories", path:"/admin/categories", desc:"Add and edit product categories" },
    { label:"🎟️ Discounts", path:"/admin/discounts", desc:"Create and manage coupons" },
    { label:"↩️ Refunds", path:"/admin/refunds", desc:"Review return & refund requests" },
  ];

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {stats && (
        <div style={styles.statsGrid}>
          {[
            { label:"Customers", value: stats.totalUsers, color:"#1976d2" },
            { label:"Vendors", value: stats.totalVendors, color:"#7b1fa2" },
            { label:"Products", value: stats.totalProducts, color:"#00897b" },
            { label:"Orders", value: stats.totalOrders, color:"#f57c00" },
            { label:"Revenue", value:`৳${stats.totalRevenue?.toFixed(2)}`, color:"#2e7d32" },
            { label:"Pending Vendors", value: stats.pendingVendors, color:"#c62828" },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={{...styles.statNum, color: s.color}}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div style={styles.navGrid}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} style={styles.navCard}>
            <span style={styles.navLabel}>{item.label}</span>
            <p style={styles.navDesc}>{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles = {
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:14, marginBottom:24 },
  statCard: { background:"#fff", borderRadius:8, padding:"14px 16px", textAlign:"center", border:"1px solid #e0e0e0" },
  statNum: { fontSize:24, fontWeight:700, margin:0 },
  statLabel: { color:"#888", fontSize:12, margin:"4px 0 0" },
  navGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 },
  navCard: { background:"#fff", border:"1px solid #e0e0e0", borderRadius:8, padding:"16px 18px", textDecoration:"none", color:"#333" },
  navLabel: { fontWeight:700, fontSize:15, display:"block", marginBottom:4 },
  navDesc: { color:"#888", fontSize:12, margin:0 },
};

export default AdminDashboard;
