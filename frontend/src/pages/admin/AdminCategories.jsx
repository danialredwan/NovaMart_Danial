import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name:"", description:"", image:"", parentCategory:"" });
  const [editId, setEditId] = useState(null);

  const fetchCategories = () => api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, parentCategory: form.parentCategory || null };
    if (editId) await api.put(`/categories/${editId}`, payload);
    else await api.post("/categories", payload);
    setForm({ name:"", description:"", image:"", parentCategory:"" });
    setEditId(null);
    fetchCategories();
  };

  const startEdit = (cat) => { setEditId(cat._id); setForm({ name:cat.name, description:cat.description||"", image:cat.image||"", parentCategory:cat.parentCategory?._id||"" }); };
  const deleteCategory = async (id) => { if (window.confirm("Delete?")) { await api.delete(`/categories/${id}`); fetchCategories(); } };

  return (
    <div style={styles.container}>
      <h2>Manage Categories</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} required placeholder="Category Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input style={styles.input} placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <input style={styles.input} placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} />
        <select style={styles.input} value={form.parentCategory} onChange={e=>setForm({...form,parentCategory:e.target.value})}>
          <option value="">No parent (top-level)</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button type="submit" style={styles.saveBtn}>{editId ? "Update" : "Add Category"}</button>
        {editId && <button type="button" onClick={()=>{setEditId(null);setForm({name:"",description:"",image:"",parentCategory:""}); }} style={styles.cancelBtn}>Cancel</button>}
      </form>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>{["Image","Name","Description","Parent","Actions"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td style={styles.td}><img src={cat.image||"https://via.placeholder.com/40"} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:4}} /></td>
                <td style={styles.td}><strong>{cat.name}</strong></td>
                <td style={styles.td}>{cat.description||"—"}</td>
                <td style={styles.td}>{cat.parentCategory?.name||"—"}</td>
                <td style={styles.td}><button onClick={()=>startEdit(cat)} style={styles.editBtn}>Edit</button> <button onClick={()=>deleteCategory(cat._id)} style={styles.delBtn}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24 },
  form: { display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, background:"#f9f9f9", padding:16, borderRadius:8 },
  input: { flex:"1 1 160px", padding:"8px 12px", border:"1px solid #ddd", borderRadius:6, fontSize:13 },
  saveBtn: { padding:"8px 18px", background:"#1976d2", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 },
  cancelBtn: { padding:"8px 14px", background:"#e0e0e0", color:"#333", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 },
  tableWrap: { overflow:"auto" },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { background:"#f5f5f5", padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, borderBottom:"1px solid #e0e0e0" },
  td: { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #eee" },
  editBtn: { background:"#e3f2fd", color:"#1565c0", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600, marginRight:4 },
  delBtn: { background:"#ffebee", color:"#c62828", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600 },
};

export default AdminCategories;
