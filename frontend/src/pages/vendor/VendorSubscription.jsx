import { useState, useEffect } from "react";
import api from "../../utils/api";

const VendorSubscription = () => {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/vendor/subscription").then(r => setCurrent(r.data)).catch(() => {});
  }, []);

  const subscribe = async (plan) => {
    if (!window.confirm(`Subscribe to the ${plan} plan?`)) return;
    setLoading(true);
    try {
      const { data } = await api.post("/vendor/subscription", { plan });
      setCurrent(data.subscription);
      alert(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated!`);
    } catch (err) { alert(err.response?.data?.message); }
    setLoading(false);
  };

  const isActive = (planId) => current?.plan === planId;

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.heading}>Vendor Subscription</h2>
          <p style={styles.sub}>Choose a plan that fits your business needs</p>
        </div>
        {current?.plan && current.plan !== "none" && (
          <div style={styles.currentBadge}>
            ✓ {current.plan.toUpperCase()} — expires {new Date(current.endDate).toLocaleDateString("en-BD")}
          </div>
        )}
      </div>

      <div style={styles.grid}>

        {/* ── Basic Plan ── */}
        <div style={{ ...styles.card, ...styles.basicCard }}>
          <div style={styles.planBadgeBasic}>BASIC</div>
          <div style={styles.priceRow}>
            <span style={styles.currency}>৳</span>
            <span style={styles.price}>999</span>
            <span style={styles.period}>/month</span>
          </div>
          <p style={styles.tagline}>Perfect for getting started</p>

          <ul style={styles.featureList}>
            {[
              { text: "List up to 50 products",         ok: true },
              { text: "Basic sales dashboard",           ok: true },
              { text: "Standard email support",          ok: true },
              { text: "Full analytics & reports",        ok: false },
              { text: "Featured product placement",      ok: false },
              { text: "Priority support",                ok: false },
              { text: "Promo badge on listings",         ok: false },
              { text: "Unlimited products",              ok: false },
            ].map((f, i) => (
              <li key={i} style={{ ...styles.featureItem, color: f.ok ? "#1e293b" : "#94a3b8" }}>
                <span style={{ color: f.ok ? "#22c55e" : "#cbd5e1", fontSize: 16 }}>{f.ok ? "✓" : "✕"}</span>
                {f.text}
              </li>
            ))}
          </ul>

          <button
            onClick={() => subscribe("basic")}
            disabled={loading || isActive("basic")}
            style={{ ...styles.btn, ...styles.basicBtn, opacity: isActive("basic") ? 0.7 : 1 }}
          >
            {isActive("basic") ? "✓ Current Plan" : "Subscribe — ৳999/mo"}
          </button>
          {isActive("basic") && <p style={styles.activeNote}>You are on this plan</p>}
        </div>

        {/* ── Premium Plan ── */}
        <div style={{ ...styles.card, ...styles.premiumCard }}>
          <div style={styles.popularBadge}>⭐ MOST POPULAR</div>
          <div style={styles.planBadgePremium}>PREMIUM</div>
          <div style={styles.priceRow}>
            <span style={{ ...styles.currency, color: "#fff" }}>৳</span>
            <span style={{ ...styles.price, color: "#fff" }}>2,999</span>
            <span style={{ ...styles.period, color: "rgba(255,255,255,0.75)" }}>/month</span>
          </div>
          <p style={{ ...styles.tagline, color: "rgba(255,255,255,0.85)" }}>For serious sellers who want to grow</p>

          <ul style={styles.featureList}>
            {[
              "Unlimited products",
              "Full analytics & reports",
              "Featured product placement",
              "Priority support (24/7)",
              "Promo badge on all listings",
              "Advanced sales insights",
              "Monthly performance report",
              "Dedicated account manager",
            ].map((f, i) => (
              <li key={i} style={{ ...styles.featureItem, color: "#fff" }}>
                <span style={{ color: "#fde68a", fontSize: 16 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => subscribe("premium")}
            disabled={loading || isActive("premium")}
            style={{ ...styles.btn, ...styles.premiumBtn, opacity: isActive("premium") ? 0.7 : 1 }}
          >
            {isActive("premium") ? "✓ Current Plan" : "Subscribe — ৳2,999/mo"}
          </button>
          {isActive("premium") && <p style={{ ...styles.activeNote, color: "rgba(255,255,255,0.8)" }}>You are on this plan</p>}
        </div>

      </div>

      {/* Feature comparison table */}
      <div style={styles.compareBox}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Plan Comparison</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Feature</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Basic</th>
              <th style={{ ...styles.th, textAlign: "center", color: "#6366f1" }}>Premium</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Products",                "Up to 50",  "Unlimited"],
              ["Analytics",              "Basic only", "Full reports"],
              ["Featured placement",     "✕",          "✓"],
              ["Promo badge",            "✕",          "✓"],
              ["Support",                "Email",      "24/7 Priority"],
              ["Account manager",        "✕",          "✓"],
              ["Price/month",            "৳999",       "৳2,999"],
            ].map(([feat, basic, premium], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                <td style={styles.td}>{feat}</td>
                <td style={{ ...styles.td, textAlign: "center", color: basic === "✕" ? "#94a3b8" : "#1e293b" }}>{basic}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: 600, color: premium === "✕" ? "#94a3b8" : "#6366f1" }}>{premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page:           { display: "flex", flexDirection: "column", gap: 24 },
  topRow:         { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  heading:        { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 },
  sub:            { margin: "4px 0 0", fontSize: 14, color: "#64748b" },
  currentBadge:   { background: "#d1fae5", color: "#065f46", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: "1px solid #86efac" },
  grid:           { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },

  // Cards
  card:           { borderRadius: 16, padding: 28, position: "relative", display: "flex", flexDirection: "column", gap: 0 },
  basicCard:      { background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  premiumCard:    { background: "linear-gradient(145deg, #6366f1, #4338ca)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" },

  planBadgeBasic:   { display: "inline-block", background: "#f1f5f9", color: "#64748b", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 16, width: "fit-content" },
  planBadgePremium: { display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 16, width: "fit-content" },
  popularBadge:     { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" },

  priceRow:   { display: "flex", alignItems: "baseline", gap: 4, margin: "0 0 6px" },
  currency:   { fontSize: 20, fontWeight: 700, color: "#1e293b" },
  price:      { fontSize: 40, fontWeight: 800, color: "#1e293b", lineHeight: 1 },
  period:     { fontSize: 14, color: "#94a3b8" },
  tagline:    { fontSize: 13, color: "#64748b", margin: "0 0 20px" },

  featureList: { listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14 },

  btn:        { width: "100%", padding: "13px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, transition: "opacity 0.2s", marginTop: "auto" },
  basicBtn:   { background: "#6366f1", color: "#fff" },
  premiumBtn: { background: "#fff", color: "#4338ca" },
  activeNote: { textAlign: "center", fontSize: 12, color: "#64748b", margin: "8px 0 0" },

  compareBox: { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" },
  table:      { width: "100%", borderCollapse: "collapse" },
  th:         { padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 700, borderBottom: "2px solid #e2e8f0", color: "#475569" },
  td:         { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f1f5f9" },
};

export default VendorSubscription;
