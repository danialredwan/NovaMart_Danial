import { useState } from "react";

const PromoBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <span style={styles.emoji}>🎉</span>
        <div style={styles.text}>
          <strong style={styles.title}>Special Eid Offer!</strong>
          <span style={styles.msg}>
            Use coupon <strong style={styles.code}>EID2026</strong> for a flat <strong>10% off</strong> the main price.
          </span>
        </div>
        <button onClick={() => setVisible(false)} style={styles.closeBtn} title="Close">✕</button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 9999,
    maxWidth: 320,
    animation: "slideIn 0.4s ease",
  },
  banner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    borderRadius: 14,
    padding: "14px 16px",
    boxShadow: "0 8px 30px rgba(99,102,241,0.4)",
    position: "relative",
  },
  emoji: { fontSize: 24, flexShrink: 0 },
  text: { display: "flex", flexDirection: "column", gap: 3, flex: 1 },
  title: { fontSize: 14, fontWeight: 800 },
  msg: { fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 },
  code: {
    background: "rgba(255,255,255,0.25)",
    padding: "1px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    width: 24,
    height: 24,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export default PromoBanner;
