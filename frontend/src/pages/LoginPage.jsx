import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/");
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>N</div>
          <span style={styles.brandText}>Nova<span style={{color:"#6366f1"}}>Mart</span></span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.footerLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "75vh",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "40px 36px",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 420,
    border: "1px solid #e2e8f0",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  brandIcon: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
  },
  brandText: { fontSize: 20, fontWeight: 800, color: "#1e293b" },
  title: { fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#64748b", margin: "0 0 24px" },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 18,
    border: "1px solid #fecaca",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    background: "#fafafa",
  },
  btn: {
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
    transition: "opacity 0.15s",
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" },
  footerLink: { color: "#6366f1", fontWeight: 600, textDecoration: "none" },
};

export default LoginPage;
