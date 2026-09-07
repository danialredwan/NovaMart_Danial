import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";

const UPLOAD_BASE = "http://localhost:5000";

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    name:"", description:"", price:"", discountedPrice:"", images:"",
    category:"", brand:"", color:"", size:"", material:"", specifications:"", stock:"", tags:""
  });

  useEffect(() => {
    api.get("/products/vendor/myproducts").then(r => setProducts(r.data)).catch(() => {});
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name:"",description:"",price:"",discountedPrice:"",images:"",category:"",brand:"",color:"",size:"",material:"",specifications:"",stock:"",tags:"" });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name:p.name, description:p.description, price:p.price,
      discountedPrice:p.discountedPrice||"", images:p.images?.join(",")||"",
      category:p.category?._id||"", brand:p.brand||"", color:p.color||"",
      size:p.size||"", material:p.material||"", specifications:p.specifications||"",
      stock:p.stock, tags:p.tags?.join(",")||""
    });
    setShowForm(true);
  };

  // Upload a local image file and append the returned URL to the images field
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Construct full URL so it can be used as src
      const fullUrl = `${UPLOAD_BASE}${data.url}`;
      setForm(prev => ({
        ...prev,
        images: prev.images ? `${prev.images},${fullUrl}` : fullUrl,
      }));
    } catch (err) {
      alert("Image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images.split(",").map(s=>s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(s=>s.trim()).filter(Boolean),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
    };
    try {
      if (editProduct) await api.put(`/products/${editProduct._id}`, payload);
      else await api.post("/products", payload);
      setShowForm(false);
      const { data } = await api.get("/products/vendor/myproducts");
      setProducts(data);
    } catch (err) { alert(err.response?.data?.message); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2>My Products</h2>
        <button onClick={openAdd} style={styles.addBtn}>+ Add Product</button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3>{editProduct ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div><label style={styles.label}>Name *</label><input style={styles.input} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div><label style={styles.label}>Category *</label>
                  <select style={styles.input} required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    <option value="">Select...</option>
                    {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label style={styles.label}>Price (৳) *</label><input style={styles.input} type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
                <div><label style={styles.label}>Discounted Price (৳)</label><input style={styles.input} type="number" value={form.discountedPrice} onChange={e=>setForm({...form,discountedPrice:e.target.value})} /></div>
                <div><label style={styles.label}>Stock *</label><input style={styles.input} type="number" required value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
                <div><label style={styles.label}>Brand</label><input style={styles.input} value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} /></div>
                <div><label style={styles.label}>Color</label><input style={styles.input} value={form.color} onChange={e=>setForm({...form,color:e.target.value})} /></div>
                <div><label style={styles.label}>Size</label><input style={styles.input} value={form.size} onChange={e=>setForm({...form,size:e.target.value})} /></div>
                <div style={{gridColumn:"1/-1"}}>
                  <label style={styles.label}>Description *</label>
                  <textarea style={{...styles.input,height:70}} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
                </div>

                {/* Image upload section */}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={styles.label}>Product Images</label>
                  <div style={styles.imageBox}>
                    {form.images.split(",").map(s=>s.trim()).filter(Boolean).map((url, i) => (
                      <div key={i} style={styles.previewWrap}>
                        <img src={url} alt="" style={styles.previewImg} onError={e=>e.target.parentElement.style.display="none"} />
                        <button
                          type="button"
                          style={styles.removeImgBtn}
                          onClick={() => {
                            const updated = form.images.split(",").map(s=>s.trim()).filter(Boolean).filter((_,idx)=>idx!==i);
                            setForm({...form, images: updated.join(",")});
                          }}
                        >×</button>
                      </div>
                    ))}
                    <label style={styles.addImgTile}>
                      {uploading ? "Uploading…" : <>
                        <span style={{fontSize:22, lineHeight:1}}>+</span>
                        <span style={{fontSize:11, color:"#888", marginTop:2}}>Add Image</span>
                      </>}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{display:"none"}}
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div style={{gridColumn:"1/-1"}}><label style={styles.label}>Tags (comma separated)</label><input style={styles.input} value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} /></div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:12}}>
                <button type="submit" style={styles.addBtn}>{editProduct?"Update":"Add Product"}</button>
                <button type="button" onClick={()=>setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>{["Image","Name","Price","Stock","Status","Actions"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td style={styles.td}><img src={p.images?.[0]||"https://via.placeholder.com/40"} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:4}} /></td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>৳ {p.discountedPrice||p.price}</td>
                <td style={styles.td}>{p.stock}</td>
                <td style={styles.td}>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600,background:p.stockStatus==="in-stock"?"#d4edda":p.stockStatus==="low-stock"?"#fff3cd":"#f8d7da",color:p.stockStatus==="in-stock"?"#155724":p.stockStatus==="low-stock"?"#856404":"#721c24"}}>
                    {p.stockStatus}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={()=>openEdit(p)} style={styles.editBtn}>Edit</button>{" "}
                  <button onClick={()=>deleteProduct(p._id)} style={styles.delBtn}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length===0 && <tr><td colSpan={6} style={{textAlign:"center",padding:24,color:"#888"}}>No products yet. Add your first product!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  addBtn: { background:"#1976d2", color:"#fff", border:"none", padding:"9px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  cancelBtn: { background:"#e0e0e0", color:"#333", border:"none", padding:"9px 16px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  modal: { position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modalBox: { background:"#fff", borderRadius:10, padding:24, width:"90%", maxWidth:680, maxHeight:"90vh", overflowY:"auto" },
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" },
  label: { fontSize:12, fontWeight:600, display:"block", marginBottom:3, color:"#555" },
  input: { width:"100%", padding:"8px 10px", marginBottom:10, border:"1px solid #ddd", borderRadius:5, fontSize:13, boxSizing:"border-box" },
  imageBox: { width:"100%", minHeight:90, padding:"8px 10px", marginBottom:10, border:"1px solid #ddd", borderRadius:5, boxSizing:"border-box", display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" },
  previewWrap: { position:"relative", display:"inline-block" },
  previewImg: { width:72, height:72, objectFit:"cover", borderRadius:5, border:"1px solid #ddd", display:"block" },
  removeImgBtn: { position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:"#ef4444", color:"#fff", border:"none", cursor:"pointer", fontSize:12, lineHeight:"18px", textAlign:"center", padding:0, fontWeight:700 },
  addImgTile: { width:72, height:72, border:"1.5px dashed #bbb", borderRadius:5, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#888", flexShrink:0 },
  tableWrap: { background:"#fff", borderRadius:8, overflow:"hidden", border:"1px solid #e0e0e0" },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { background:"#f5f5f5", padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, borderBottom:"1px solid #e0e0e0" },
  td: { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #eee" },
  editBtn: { background:"#e3f2fd", color:"#1565c0", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600, marginRight:4 },
  delBtn: { background:"#ffebee", color:"#c62828", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600 },
};

export default VendorProducts;
