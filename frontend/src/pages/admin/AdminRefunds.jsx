import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [filter, setFilter] = useState("pending");

  const fetchRefunds = () => api.get(`/refunds?status=${filter}`).then(r => setRefunds(r.data)).catch(() => {});
  useEffect(() => { fetchRefunds(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await api.put(`/refunds/${id}`, { status }); fetchRefunds(); }
    catch (err) { alert(err.response?.data?.message); }
  };

  const statusColors = { pending:"#ff9800", approved:"#4caf50", rejected:"#e53935" };

  return (
    <div style={styles.container}>
      <h2>Refund Requests</h2>
      <div style={styles.filterRow}>
        {["pending","approved","rejected"].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{...styles.filterBtn, background: filter===s?"#1976d2":"#fff", color: filter===s?"#fff":"#333"}}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      {refunds.length === 0 && <p style={{color:"#888",padding:"20px 0"}}>No {filter} refund requests.</p>}
      {refunds.map(r => (
        <div key={r._id} style={styles.refundCard}>
          <div style={styles.cardTop}>
            <div>
              <strong>{r.customer?.name}</strong> <span style={{color:"#888",fontSize:13}}>({r.customer?.email})</span>
              <p style={{margin:"2px 0",fontSize:13,color:"#555"}}>Order Total: ৳{r.order?.finalPrice} | Status: {r.order?.orderStatus}</p>
            </div>
            <span style={{...styles.badge, background: statusColors[r.status]}}>{r.status}</span>
          </div>
          <p style={styles.reason}><strong>Reason:</strong> {r.reason}</p>
          <p style={{fontSize:12,color:"#aaa"}}>Submitted: {new Date(r.createdAt).toLocaleDateString()}</p>
          {r.status === "pending" && (
            <div style={styles.actions}>
              <button onClick={() => updateStatus(r._id, "approved")} style={styles.approveBtn}>Approve Refund</button>
              <button onClick={() => updateStatus(r._id, "rejected")} style={styles.rejectBtn}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container:{ background:"#fff", borderRadius:10, padding:24 },
  filterRow:{ display:"flex", gap:8, marginBottom:16 },
  filterBtn:{ padding:"7px 16px", border:"1px solid #ddd", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:13 },
  refundCard:{ border:"1px solid #e0e0e0", borderRadius:8, padding:16, marginBottom:12 },
  cardTop:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 },
  badge:{ color:"#fff", padding:"3px 12px", borderRadius:12, fontSize:12, fontWeight:600 },
  reason:{ background:"#f9f9f9", borderRadius:4, padding:"8px 12px", fontSize:13, margin:"8px 0" },
  actions:{ display:"flex", gap:10, marginTop:8 },
  approveBtn:{ background:"#e8f5e9", color:"#2e7d32", border:"none", padding:"7px 16px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  rejectBtn:{ background:"#ffebee", color:"#c62828", border:"none", padding:"7px 16px", borderRadius:6, cursor:"pointer", fontWeight:600 },
};

export default AdminRefunds;
