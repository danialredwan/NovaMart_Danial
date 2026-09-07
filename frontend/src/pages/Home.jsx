import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

const CATEGORY_ICONS = ["🛍️","👗","📱","🏠","🎮","📚","💄","⚽","🍳","🎸"];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
    api.get("/products?sort=createdAt").then(r => setFeatured(r.data.slice(0, 8))).catch(() => {});
    api.get("/discounts/active").then(r => setDeals(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:32}}>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Multi-Vendor Marketplace</div>
          <h1 style={styles.heroTitle}>
            Discover. Shop.<br />
            <span style={styles.heroHighlight}>Save Big.</span>
          </h1>
          <p style={styles.heroSub}>
            Thousands of products from verified sellers. Fast delivery, secure payments.
          </p>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchWrap}>
              <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                style={styles.searchInput}
                placeholder="Search for products, brands, categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" style={styles.searchBtn}>Search</button>
            </div>
          </form>
          <div style={styles.heroStats}>
            <div style={styles.stat}><span style={styles.statNum}>10K+</span><span style={styles.statLabel}>Products</span></div>
            <div style={styles.statDiv}/>
            <div style={styles.stat}><span style={styles.statNum}>500+</span><span style={styles.statLabel}>Vendors</span></div>
            <div style={styles.statDiv}/>
            <div style={styles.stat}><span style={styles.statNum}>50K+</span><span style={styles.statLabel}>Customers</span></div>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.heroBlob1}/>
          <div style={styles.heroBlob2}/>
          <div style={styles.heroCard}>
            <div style={styles.heroCardDot}/>
            <p style={{fontSize:13,color:"#64748b",margin:0}}>New arrivals today</p>
            <p style={{fontSize:22,fontWeight:800,color:"#1e293b",margin:"4px 0"}}>+128 Products</p>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              {["#e0e7ff","#fef3c7","#d1fae5","#fee2e2"].map((bg,i)=>(
                <div key={i} style={{width:32,height:32,borderRadius:8,background:bg}}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals Banner */}
      {deals.length > 0 && (
        <div style={styles.dealsBanner}>
          <span style={styles.dealsLabel}>🎉 Active Deals</span>
          <div style={styles.dealsList}>
            {deals.map(d => (
              <span key={d._id} style={styles.dealTag}>
                <strong>{d.code}</strong> — {d.type === "percentage" ? `${d.value}% OFF` : `৳${d.value} OFF`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <section>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Shop by Category</h2>
            <p style={styles.sectionSub}>Browse our wide selection of categories</p>
          </div>
          <Link to="/products" style={styles.viewAllLink}>View All →</Link>
        </div>
        <div style={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <Link key={cat._id} to={`/products?category=${cat._id}`} style={styles.categoryCard}>
              <div style={styles.catIconWrap}>
                {cat.image
                  ? <img src={cat.image} alt={cat.name} style={styles.catImg}/>
                  : <span style={{fontSize:28}}>{CATEGORY_ICONS[idx % CATEGORY_ICONS.length]}</span>
                }
              </div>
              <span style={styles.catName}>{cat.name}</span>
            </Link>
          ))}
          {categories.length === 0 && (
            <p style={{color:"#94a3b8",gridColumn:"1/-1"}}>No categories yet.</p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Featured Products</h2>
            <p style={styles.sectionSub}>Hand-picked products just for you</p>
          </div>
          {featured.length > 0 && (
            <Link to="/products" style={styles.viewAllLink}>View All →</Link>
          )}
        </div>
        <div style={styles.productGrid}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
          {featured.length === 0 && (
            <p style={{color:"#94a3b8",gridColumn:"1/-1",textAlign:"center",padding:32}}>
              No products yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <div style={styles.ctaBanner}>
        <div>
          <h3 style={{color:"#fff",fontSize:20,fontWeight:700,margin:"0 0 4px"}}>Are you a seller?</h3>
          <p style={{color:"rgba(255,255,255,0.8)",margin:0,fontSize:14}}>Join thousands of vendors and start selling today.</p>
        </div>
        <Link to="/register" style={styles.ctaBtn}>Become a Vendor</Link>
      </div>

    </div>
  );
};

const styles = {
  /* Hero */
  hero: {
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
    borderRadius: 20,
    padding: "48px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 32,
    position: "relative",
    overflow: "hidden",
    minHeight: 340,
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroBadge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "4px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 16,
    letterSpacing: "0.5px",
    backdropFilter: "blur(4px)",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 800,
    color: "#fff",
    margin: "0 0 12px",
    lineHeight: 1.15,
    letterSpacing: "-1px",
  },
  heroHighlight: {
    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: { color: "rgba(255,255,255,0.85)", margin: "0 0 24px", fontSize: 15, maxWidth: 440 },
  searchForm: { marginBottom: 28 },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: 12,
    maxWidth: 520,
    padding: "4px 4px 4px 14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    padding: "8px 12px",
    background: "transparent",
    color: "#1e293b",
  },
  searchBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  heroStats: { display: "flex", alignItems: "center", gap: 16 },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: 800, color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 },
  statDiv: { width: 1, height: 32, background: "rgba(255,255,255,0.3)" },
  heroVisual: { position: "relative", width: 220, flexShrink: 0, height: 180 },
  heroBlob1: {
    position: "absolute", width: 160, height: 160, background: "rgba(255,255,255,0.1)",
    borderRadius: "50%", top: -20, right: -20,
  },
  heroBlob2: {
    position: "absolute", width: 100, height: 100, background: "rgba(255,255,255,0.1)",
    borderRadius: "50%", bottom: -10, left: -10,
  },
  heroCard: {
    position: "absolute",
    background: "#fff",
    borderRadius: 16,
    padding: "16px 20px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
    top: 20,
    left: 10,
    width: 190,
    zIndex: 1,
  },
  heroCardDot: {
    width: 8, height: 8, borderRadius: "50%", background: "#10b981", marginBottom: 8,
    boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
  },

  /* Deals */
  dealsBanner: {
    background: "linear-gradient(90deg, #fef3c7, #fffbeb)",
    border: "1px solid #fde68a",
    borderRadius: 12,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  dealsLabel: { fontSize: 13, fontWeight: 700, color: "#92400e", whiteSpace: "nowrap" },
  dealsList: { display: "flex", gap: 8, flexWrap: "wrap" },
  dealTag: {
    background: "#fff",
    border: "1px solid #fde68a",
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 12,
    color: "#92400e",
  },

  /* Section */
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" },
  sectionSub: { fontSize: 13, color: "#94a3b8", margin: 0 },
  viewAllLink: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6366f1",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },

  /* Categories */
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: 12,
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "16px 8px",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    transition: "all 0.18s ease",
    cursor: "pointer",
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "#f0f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  catImg: { width: 52, height: 52, objectFit: "cover" },
  catName: { fontSize: 12, fontWeight: 600, color: "#475569", textAlign: "center" },

  /* Products */
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 20,
  },

  /* CTA */
  ctaBanner: {
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    borderRadius: 16,
    padding: "28px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  ctaBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
  },
};

export default Home;
