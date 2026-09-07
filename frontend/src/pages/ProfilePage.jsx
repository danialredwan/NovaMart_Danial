import { useState, useEffect } from "react";
import api from "../utils/api";

const ProfilePage = () => {
  const [form, setForm]     = useState({ name: "", phone: "", address: "", storeName: "", storeDescription: "", password: "" });
  const [profile, setProfile] = useState(null);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    api.get("/auth/profile").then(r => {
      setProfile(r.data);
      setForm({ name: r.data.name, phone: r.data.phone || "", address: r.data.address || "", storeName: r.data.storeName || "", storeDescription: r.data.storeDescription || "", password: "" });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      const { data } = await api.put("/auth/profile", payload);
      localStorage.setItem("novamartUser", JSON.stringify(data));
      setProfile(prev => ({ ...prev, ...data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { alert(err.response?.data?.message); }
  };

  if (!profile) return <p style={{ textAlign: "center", padding: 40 }}>Loading...</p>;

  // ── Loyalty tier config ──────────────────────────────────────────────────
  const pts = profile.loyaltyPoints || 0;
  const tiers = [
    { name: "Bronze",   min: 0,       max: 299999,  color: "#cd7f32", bg: "#fdf3e7", perk: "Earn points on every purchase",          icon: "🥉" },
    { name: "Silver",   min: 300000,  max: 499999,  color: "#94a3b8", bg: "#f1f5f9", perk: "🚚 FREE delivery on all orders",         icon: "🥈" },
    { name: "Gold",     min: 500000,  max: Infinity, color: "#f59e0b", bg: "#fef9c3", perk: "🚚 FREE delivery + 👑 15% off every order", icon: "🥇" },
  ];

  const currentTier = tiers.find(t => pts >= t.min && pts <= t.max) || tiers[0];
  const nextTier    = tiers[tiers.indexOf(currentTier) + 1];

  // progress within current tier
  const tierProgress = nextTier
    ? Math.min(100, ((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;
  const ptsToNext = nextTier ? Math.max(0, nextTier.min - pts) : 0;

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.avatar}>{profile.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{profile.name}</h2>
          <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 13 }}>{profile.email} · {profile.role}</p>
          {profile.role === "vendor" && (
            <span style={{ ...styles.chip, background: profile.isApproved ? "#d1fae5" : "#fef3c7", color: profile.isApproved ? "#065f46" : "#92400e" }}>
              {profile.isApproved ? "✓ Approved Vendor" : "⏳ Pending Approval"}
            </span>
          )}
        </div>
      </div>

      {/* ── Loyalty Section (customers only) ── */}
      {profile.role === "customer" && (
        <div style={{ ...styles.card, background: currentTier.bg, border: `1.5px solid ${currentTier.color}30` }}>
          <div style={styles.tierHeader}>
            <div>
              <span style={styles.tierLabel}>Loyalty Tier</span>
              <div style={styles.tierName}>
                <span style={{ fontSize: 22 }}>{currentTier.icon}</span>
                <span style={{ color: currentTier.color, fontWeight: 800, fontSize: 20 }}>{currentTier.name} Member</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{currentTier.perk}</p>
            </div>
            <div style={styles.pointsBubble}>
              <span style={styles.pointsNum}>{pts.toLocaleString()}</span>
              <span style={styles.pointsLabel}>points</span>
            </div>
          </div>

          {/* Progress bar to next tier */}
          {nextTier && (
            <div style={{ marginTop: 14 }}>
              <div style={styles.progressMeta}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Progress to {nextTier.icon} {nextTier.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: currentTier.color }}>{pts.toLocaleString()} / {nextTier.min.toLocaleString()}</span>
              </div>
              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: `${tierProgress}%`, background: currentTier.color }} />
              </div>
              <p style={styles.progressHint}>
                Earn <strong>{ptsToNext.toLocaleString()}</strong> more points to unlock: <strong>{nextTier.perk}</strong>
              </p>
            </div>
          )}
          {!nextTier && (
            <p style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 600, color: "#d97706" }}>
              👑 You've reached the highest tier — all rewards unlocked!
            </p>
          )}

          {/* Tier overview */}
          <div style={styles.tierGrid}>
            {tiers.map(t => (
              <div key={t.name} style={{ ...styles.tierCard, borderColor: pts >= t.min ? t.color : "#e2e8f0", opacity: pts >= t.min ? 1 : 0.5 }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: pts >= t.min ? t.color : "#94a3b8" }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "#64748b", textAlign: "center" }}>{t.min.toLocaleString()}+ pts</span>
                <span style={{ fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.4 }}>{t.perk}</span>
                {pts >= t.min && <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>✓ UNLOCKED</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Profile Form ── */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Edit Profile</h3>
        <form onSubmit={handleSave}>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <label style={styles.label}>Phone</label>
          <input style={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

          <label style={styles.label}>Address</label>
          <input style={styles.input} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

          {profile.role === "vendor" && (
            <>
              <label style={styles.label}>Store Name</label>
              <input style={styles.input} value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} />
              <label style={styles.label}>Store Description</label>
              <textarea style={{ ...styles.input, height: 70, resize: "vertical" }} value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })} />
            </>
          )}

          <label style={styles.label}>New Password (leave blank to keep current)</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="submit" style={styles.saveBtn}>Save Changes</button>
            {saved && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page:         { display: "flex", flexDirection: "column", gap: 20, maxWidth: 640, margin: "0 auto" },
  header:       { background: "#fff", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 16, border: "1px solid #e2e8f0" },
  avatar:       { width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, flexShrink: 0 },
  chip:         { display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  card:         { background: "#fff", borderRadius: 12, padding: 22, border: "1px solid #e2e8f0" },
  cardTitle:    { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" },
  tierHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  tierLabel:    { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 },
  tierName:     { display: "flex", alignItems: "center", gap: 8 },
  pointsBubble: { textAlign: "center", background: "#fff", borderRadius: 12, padding: "10px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0 },
  pointsNum:    { display: "block", fontSize: 22, fontWeight: 800, color: "#1e293b" },
  pointsLabel:  { fontSize: 11, color: "#94a3b8", fontWeight: 600 },
  progressMeta: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  progressBg:   { height: 10, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  progressHint: { margin: "6px 0 0", fontSize: 12, color: "#64748b" },
  tierGrid:     { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16 },
  tierCard:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 8px", borderRadius: 10, border: "1.5px solid", background: "#fff" },
  label:        { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4, color: "#555" },
  input:        { width: "100%", padding: "9px 12px", marginBottom: 12, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  saveBtn:      { background: "#6366f1", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
};

export default ProfilePage;
