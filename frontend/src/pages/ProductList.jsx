import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";

const PER_PAGE = 15;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    stockStatus: "",
    sort: "createdAt",
  });

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const updateFilter = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ search:"", category:"", brand:"", color:"", minPrice:"", maxPrice:"", stockStatus:"", sort:"createdAt" }); setPage(1); };

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilterCount = [filters.category, filters.brand, filters.color, filters.minPrice, filters.maxPrice, filters.stockStatus].filter(Boolean).length;

  return (
    <div style={styles.layout}>
      {/* Filter Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sideHeader}>
          <h3 style={styles.sideTitle}>Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={styles.clearBtn}>
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select style={styles.filterSelect} value={filters.category} onChange={e => updateFilter("category", e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Brand</label>
          <input style={styles.filterInput} placeholder="e.g. Samsung, Apple" value={filters.brand} onChange={e => updateFilter("brand", e.target.value)} />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Color</label>
          <input style={styles.filterInput} placeholder="e.g. Red, Blue" value={filters.color} onChange={e => updateFilter("color", e.target.value)} />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Price Range (৳)</label>
          <div style={{display:"flex", gap:8}}>
            <input style={{...styles.filterInput, marginBottom:0}} type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter("minPrice", e.target.value)} />
            <input style={{...styles.filterInput, marginBottom:0}} type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter("maxPrice", e.target.value)} />
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Availability</label>
          {[["","All"],["in-stock","In Stock"],["low-stock","Low Stock"],["out-of-stock","Out of Stock"]].map(([val,label]) => (
            <label key={val} style={styles.radioRow}>
              <input type="radio" name="stock" value={val} checked={filters.stockStatus===val} onChange={() => updateFilter("stockStatus", val)} />
              {label}
            </label>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              style={styles.searchInput}
              placeholder="Search products..."
              value={filters.search}
              onChange={e => updateFilter("search", e.target.value)}
            />
          </div>
          <select style={styles.sortSelect} value={filters.sort} onChange={e => updateFilter("sort", e.target.value)}>
            <option value="createdAt">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
        </div>

        <p style={styles.count}>
          {loading ? "Loading..." : <><strong>{products.length}</strong> products found &nbsp;·&nbsp; page <strong>{page}</strong> of <strong>{totalPages || 1}</strong></>}
        </p>

        {loading ? (
          <div style={styles.loadingGrid}>
            {[...Array(15)].map((_, i) => <div key={i} style={styles.skeleton} />)}
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {paginated.map(p => <ProductCard key={p._id} product={p} />)}
              {products.length === 0 && (
                <div style={styles.empty}>
                  <p style={{fontSize:16,color:"#64748b",fontWeight:600}}>No products found</p>
                  <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Try adjusting your filters or search term.</p>
                  <button onClick={clearFilters} style={styles.resetBtn}>Reset Filters</button>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button style={{...styles.pageBtn, opacity: page===1?0.4:1}} disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                {Array.from({length: totalPages}, (_, i) => i+1).map(n => (
                  <button key={n} style={{...styles.pageBtn, ...(n===page ? styles.pageBtnActive : {})}} onClick={()=>setPage(n)}>{n}</button>
                ))}
                <button style={{...styles.pageBtn, opacity: page===totalPages?0.4:1}} disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const styles = {
  layout: { display: "flex", gap: 24, alignItems: "flex-start" },
  sidebar: {
    width: 230,
    flexShrink: 0,
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 80,
  },
  sideHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sideTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 },
  clearBtn: {
    fontSize: 11, fontWeight: 600, color: "#ef4444",
    background: "#fee2e2", border: "none", borderRadius: 6,
    padding: "3px 8px", cursor: "pointer",
  },
  filterGroup: { marginBottom: 20 },
  filterLabel: { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" },
  filterSelect: { width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#fafafa", outline: "none" },
  filterInput: { width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#fafafa", outline: "none", boxSizing: "border-box" },
  radioRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer", marginBottom: 6 },
  main: { flex: 1, minWidth: 0 },
  topBar: { display: "flex", gap: 10, marginBottom: 16 },
  searchWrap: {
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: 10, padding: "0 12px",
  },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: 14, padding: "10px 0", background: "transparent" },
  sortSelect: { padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#475569", background: "#fff", outline: "none" },
  count: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 },
  loadingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 },
  skeleton: { height: 280, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", borderRadius: 12, backgroundSize: "400% 100%", animation: "shimmer 1.4s ease infinite" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: "48px 20px" },
  resetBtn: { marginTop: 14, padding: "9px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  pagination: { display: "flex", gap: 6, justifyContent: "center", alignItems: "center", marginTop: 28, flexWrap: "wrap" },
  pageBtn: { padding: "7px 13px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  pageBtnActive: { background: "#6366f1", color: "#fff", borderColor: "#6366f1" },
};

export default ProductList;
