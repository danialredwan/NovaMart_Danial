import { useState, useEffect } from "react";
import api from "../../utils/api";

const VendorAnalytics = () => {
  const [data, setData]         = useState(null);
  const [plan, setPlan]         = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    api.get("/vendor/analytics").then(r => setData(r.data)).catch(() => {});
    api.get("/vendor/subscription")
      .then(r => setPlan(r.data?.plan || "none"))
      .catch(() => setPlan("none"))
      .finally(() => setLoadingPlan(false));
  }, []);

  if (!data || loadingPlan) return <p style={{ padding: 24, color: "#64748b" }}>Loading analytics...</p>;

  const isPremium = plan === "premium";

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Sales Analytics</h2>
          <p style={styles.sub}>
            {isPremium
              ? "Full analytics — Premium plan active"
              : "Basic analytics — upgrade to Premium for full reports"}
          </p>
        </div>
        <div style={{ ...styles.planBadge, ...(isPremium ? styles.premiumBadge : styles.basicBadge) }}>
          {isPremium ? "⭐ Premium" : "Basic"}
        </div>
      </div>

      {/* Stat cards — visible to all */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statNum}>৳ {parseFloat(data.totalRevenue || 0).toLocaleString()}</p>
          <p style={styles.statLbl}>Total Revenue</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{data.totalOrders ?? 0}</p>
          <p style={styles.statLbl}>Total Orders</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{data.totalProducts ?? 0}</p>
          <p style={styles.statLbl}>Products Listed</p>
        </div>
      </div>

      {/* Monthly Sales Chart — visible to all plans */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Monthly Sales</h3>
        {Object.entries(data.monthlySales || {}).length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>No monthly data yet.</p>
        ) : (
          <div style={styles.barChart}>
            {Object.entries(data.monthlySales).map(([month, revenue]) => {
              const max = Math.max(...Object.values(data.monthlySales));
              const pct = max > 0 ? (revenue / max) * 100 : 0;
              return (
                <div key={month} style={styles.barGroup}>
                  <p style={styles.barValue}>৳ {parseFloat(revenue).toFixed(0)}</p>
                  <div style={{ ...styles.bar, height: `${Math.max(pct, 2)}%` }} />
                  <p style={styles.barLabel}>{month}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium-only content */}
      {isPremium ? (
        <>
          {/* Top Products Table */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Top Performing Products</h3>
              <span style={styles.premiumTag}>Premium</span>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Units Sold</th>
                  <th style={styles.th}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts?.length === 0 ? (
                  <tr><td colSpan={4} style={styles.emptyCell}>No sales data yet</td></tr>
                ) : (
                  data.topProducts?.map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                      <td style={{ ...styles.td, color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.sales}</td>
                      <td style={{ ...styles.td, color: "#6366f1", fontWeight: 600 }}>৳ {parseFloat(p.revenue).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Advanced metrics row */}
          <div style={styles.advancedGrid}>
            <div style={styles.advCard}>
              <p style={styles.advLabel}>Avg. Order Value</p>
              <p style={styles.advNum}>
                ৳ {data.totalOrders > 0 ? (parseFloat(data.totalRevenue) / data.totalOrders).toFixed(2) : "0.00"}
              </p>
            </div>
            <div style={styles.advCard}>
              <p style={styles.advLabel}>Revenue / Product</p>
              <p style={styles.advNum}>
                ৳ {data.totalProducts > 0 ? (parseFloat(data.totalRevenue) / data.totalProducts).toFixed(2) : "0.00"}
              </p>
            </div>
            <div style={styles.advCard}>
              <p style={styles.advLabel}>Best Month</p>
              <p style={styles.advNum}>
                {Object.entries(data.monthlySales || {}).length > 0
                  ? Object.entries(data.monthlySales).sort((a, b) => b[1] - a[1])[0][0]
                  : "—"}
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Basic plan — locked sections */
        <>
          <div style={styles.lockedSection}>
            <div style={styles.lockIcon}>🔒</div>
            <h3 style={styles.lockTitle}>Top Performing Products</h3>
            <p style={styles.lockDesc}>See which products drive the most sales and revenue. Available on Premium plan.</p>
            <div style={styles.blurredTable}>
              {["Product A", "Product B", "Product C"].map((name, i) => (
                <div key={i} style={styles.blurredRow}>
                  <span style={{ filter: "blur(5px)", flex: 1 }}>{name}</span>
                  <span style={{ filter: "blur(5px)" }}>xx sold</span>
                  <span style={{ filter: "blur(5px)" }}>৳ xxx.xx</span>
                </div>
              ))}
            </div>
            <a href="/vendor/subscription" style={styles.upgradeBtn}>⭐ Upgrade to Premium — ৳2,999/mo</a>
          </div>

          <div style={styles.lockedSection}>
            <div style={styles.lockIcon}>🔒</div>
            <h3 style={styles.lockTitle}>Advanced Metrics</h3>
            <p style={styles.lockDesc}>Average order value, revenue per product, best-performing month, and more. Premium only.</p>
            <a href="/vendor/subscription" style={styles.upgradeBtn}>⭐ Upgrade to Premium — ৳2,999/mo</a>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  page:         { display: "flex", flexDirection: "column", gap: 20 },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 },
  heading:      { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 },
  sub:          { margin: "4px 0 0", fontSize: 13, color: "#64748b" },
  planBadge:    { padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  basicBadge:   { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" },
  premiumBadge: { background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff" },

  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  statCard:   { background: "#fff", borderRadius: 12, padding: "20px 24px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  statNum:    { fontSize: 28, fontWeight: 800, color: "#6366f1", margin: 0 },
  statLbl:    { color: "#94a3b8", fontSize: 13, margin: "6px 0 0" },

  section:       { background: "#fff", borderRadius: 12, padding: 22, border: "1px solid #e2e8f0" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 },
  premiumTag:    { background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 10px", borderRadius: 20 },

  barChart:   { display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingTop: 24 },
  barGroup:   { display: "flex", flexDirection: "column", alignItems: "center", flex: 1 },
  bar:        { width: "100%", background: "linear-gradient(to top,#6366f1,#818cf8)", borderRadius: "4px 4px 0 0", minHeight: 4 },
  barLabel:   { fontSize: 10, color: "#94a3b8", margin: "4px 0 0" },
  barValue:   { fontSize: 10, color: "#6366f1", fontWeight: 700, marginBottom: 4 },

  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, borderBottom: "2px solid #e2e8f0", color: "#475569", background: "#f8fafc" },
  td:         { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f1f5f9" },
  emptyCell:  { textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 },

  advancedGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  advCard:      { background: "linear-gradient(135deg,#6366f1,#4338ca)", borderRadius: 12, padding: "18px 22px", color: "#fff" },
  advLabel:     { fontSize: 12, margin: "0 0 6px", opacity: 0.8 },
  advNum:       { fontSize: 22, fontWeight: 800, margin: 0 },

  lockedSection: { background: "#fff", borderRadius: 12, padding: 28, border: "2px dashed #e2e8f0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  lockIcon:      { fontSize: 32 },
  lockTitle:     { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 },
  lockDesc:      { fontSize: 13, color: "#64748b", maxWidth: 400, margin: 0 },
  upgradeBtn:    { display: "inline-block", marginTop: 6, background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", padding: "10px 22px", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" },

  blurredChart: { display: "flex", alignItems: "flex-end", gap: 6, height: 80, opacity: 0.3, pointerEvents: "none", margin: "6px 0" },
  blurredBar:   { width: 28, background: "#6366f1", borderRadius: "4px 4px 0 0" },
  blurredTable: { display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 400, margin: "6px 0" },
  blurredRow:   { display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 14px", background: "#f8fafc", borderRadius: 6, fontSize: 13 },
};

export default VendorAnalytics;
