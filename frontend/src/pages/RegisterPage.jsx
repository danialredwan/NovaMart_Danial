import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"customer", storeName:"", storeDescription:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "vendor") navigate("/vendor/dashboard");
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

        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Join thousands of shoppers and sellers</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Role toggle */}
        <div style={styles.roleToggle}>
          {["customer", "vendor"].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({...form, role: r})}
              style={{
                ...styles.roleBtn,
                background: form.role === r ? "#6366f1" : "transparent",
                color: form.role === r ? "#fff" : "#64748b",
                fontWeight: form.role === r ? 700 : 500,
              }}
            >
              {r === "customer" ? "🛍️ Customer" : "🏪 Vendor / Seller"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} placeholder="John Doe" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input style={styles.input} type="email" placeholder="you@example.com" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Min. 6 characters" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          </div>

          {form.role === "vendor" && (
            <>
              <div style={styles.vendorBanner}>
                <strong style={{color:"#92400e"}}>Vendor account</strong>
                <span style={{color:"#a16207",fontSize:12,marginTop:2}}>Your account will be reviewed and approved by an admin before you can sell.</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Store Name</label>
                <input style={styles.input} placeholder="My Awesome Store" value={form.storeName} onChange={e=>setForm({...form,storeName:e.target.value})} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Store Description</label>
                <textarea style={{...styles.input, height:80, resize:"vertical"}} placeholder="Tell us about your store..." value={form.storeDescription} onChange={e=>setForm({...form,storeDescription:e.target.value})} />
              </div>
            </>
          )}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "75vh",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "36px 32px",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
    width: "100%",
    maxWidth: 460,
    border: "1px solid #e2e8f0",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  brandIcon: {
    width: 36, height: 36,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 800,
  },
  brandText: { fontSize: 20, fontWeight: 800, color: "#1e293b" },
  title: { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" },
  subtitle: { fontSize: 14, color: "#64748b", margin: "0 0 20px" },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fee2e2", color: "#991b1b",
    padding: "10px 14px", borderRadius: 8,
    fontSize: 13, fontWeight: 500, marginBottom: 16,
    border: "1px solid #fecaca",
  },
  roleToggle: {
    display: "flex",
    background: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1, padding: "8px 12px",
    border: "none", borderRadius: 8,
    fontSize: 13, cursor: "pointer",
    transition: "all 0.15s",
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14,
    color: "#1e293b", outline: "none",
    background: "#fafafa",
    transition: "border-color 0.15s",
  },
  vendorBanner: {
    display: "flex", flexDirection: "column",
    background: "#fef3c7", border: "1px solid #fde68a",
    borderRadius: 8, padding: "10px 14px",
  },
  btn: {
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff", border: "none", borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    marginTop: 6,
    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
  },
  footer: { textAlign: "center", marginTop: 22, fontSize: 14, color: "#64748b" },
  footerLink: { color: "#6366f1", fontWeight: 600, textDecoration: "none" },
};

export default RegisterPage;
