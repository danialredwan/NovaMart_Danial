import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({ code:"", type:"percentage", value:"", minOrderAmount:"", expiresAt:"" });

  const fetch = () => api.get("/discounts").then(r => setDiscounts(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post("/discounts", form); setForm({ code:"",type:"percentage",value:"",minOrderAmount:"",expiresAt:"" }); fetch(); }
    catch (err) { alert(err.response?.data?.message); }
  };

  const toggleActive = async (id, isActive) => { await api.put(`/discounts/${id}`, { isActive: !isActive }); fetch(); };
  const deleteCoupon = async (id) => { if (window.confirm("Delete?")) { await api.delete(`/discounts/${id}`); fetch(); } };

  return (
    <div style={styles.container}>
      <h2>Discount Coupons</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} required placeholder="Coupon Code (e.g. SAVE20)" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} />
        <select style={styles.input} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (৳)</option></select>
        <input style={styles.input} type="number" required placeholder="Value (e.g. 20)" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} />
        <input style={styles.input} type="number" placeholder="Min. Order (৳)" value={form.minOrderAmount} onChange={e=>setForm({...form,minOrderAmount:e.target.value})} />
        <input style={styles.input} type="date" required value={form.expiresAt} onChange={e=>setForm({...form,expiresAt:e.target.value})} />
        <button type="submit" style={styles.addBtn}>Create Coupon</button>
      </form>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>{["Code","Type","Value","Min Order","Expires","Status","Actions"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d._id}>
                <td style={styles.td}><strong>{d.code}</strong></td>
                <td style={styles.td}>{d.type}</td>
                <td style={styles.td}>{d.type==="percentage"?`${d.value}%`:`৳${d.value}`}</td>
                <td style={styles.td}>৳{d.minOrderAmount}</td>
                <td style={styles.td}>{new Date(d.expiresAt).toLocaleDateString()}</td>
                <td style={styles.td}><span style={{padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600,background:d.isActive&&new Date(d.expiresAt)>new Date()?"#d4edda":"#f8d7da",color:d.isActive&&new Date(d.expiresAt)>new Date()?"#155724":"#721c24"}}>{d.isActive&&new Date(d.expiresAt)>new Date()?"Active":"Inactive"}</span></td>
                <td style={styles.td}><button onClick={()=>toggleActive(d._id,d.isActive)} style={styles.editBtn}>{d.isActive?"Deactivate":"Activate"}</button> <button onClick={()=>deleteCoupon(d._id)} style={styles.delBtn}>Delete</button></td>
              </tr>
            ))}
            {discounts.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:20,color:"#888"}}>No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container:{ background:"#fff", borderRadius:10, padding:24 },
  form:{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, background:"#f9f9f9", padding:16, borderRadius:8 },
  input:{ flex:"1 1 150px", padding:"8px 12px", border:"1px solid #ddd", borderRadius:6, fontSize:13 },
  addBtn:{ padding:"8px 18px", background:"#1976d2", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 },
  tableWrap:{ overflow:"auto" },
  table:{ width:"100%", borderCollapse:"collapse" },
  th:{ background:"#f5f5f5", padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, borderBottom:"1px solid #e0e0e0" },
  td:{ padding:"10px 14px", fontSize:13, borderBottom:"1px solid #eee" },
  editBtn:{ background:"#e3f2fd", color:"#1565c0", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600, marginRight:4 },
  delBtn:{ background:"#ffebee", color:"#c62828", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600 },
};

export default AdminDiscounts;
