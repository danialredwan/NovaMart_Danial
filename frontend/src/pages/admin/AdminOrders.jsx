import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  const fetchOrders = () => {
    const q = filter ? `?status=${filter}` : "";
    api.get(`/admin/orders${q}`).then(r => setOrders(r.data)).catch(() => {});
  };
  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId, orderStatus) => {
    try { await api.put(`/orders/${orderId}/status`, { orderStatus }); fetchOrders(); }
    catch (err) { alert(err.response?.data?.message); }
  };

  const statusColors = { pending:"#ff9800", processing:"#2196f3", shipped:"#9c27b0", delivered:"#4caf50", cancelled:"#e53935" };
  const allStatuses = ["","pending","processing","shipped","delivered","cancelled"];

  return (
    <div style={styles.container}>
      <h2>All Orders</h2>
      <div style={styles.filterRow}>
        {allStatuses.map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{...styles.filterBtn, background: filter===s?"#1976d2":"#fff", color: filter===s?"#fff":"#333"}}>
            {s ? s.charAt(0).toUpperCase()+s.slice(1) : "All"}
          </button>
        ))}
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>{["Order ID","Customer","Items","Total","Payment","Status","Update"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td style={styles.td}><strong>#{o._id.slice(-8).toUpperCase()}</strong><br/><span style={{color:"#aaa",fontSize:11}}>{new Date(o.createdAt).toLocaleDateString()}</span></td>
                <td style={styles.td}>{o.customer?.name}<br/><span style={{color:"#888",fontSize:11}}>{o.customer?.email}</span></td>
                <td style={styles.td}>{o.items?.length} item(s)</td>
                <td style={styles.td}><strong style={{color:"#e53935"}}>৳{o.finalPrice}</strong></td>
                <td style={styles.td}>{o.paymentMethod}<br/><span style={{fontSize:11,color: o.paymentStatus==="paid"?"green":"orange"}}>{o.paymentStatus}</span></td>
                <td style={styles.td}><span style={{...styles.badge, background: statusColors[o.orderStatus]}}>{o.orderStatus}</span></td>
                <td style={styles.td}>
                  {o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && (
                    <select style={styles.select} value={o.orderStatus} onChange={e=>updateStatus(o._id, e.target.value)}>
                      {["pending","processing","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {orders.length===0&&<tr><td colSpan={7} style={{textAlign:"center",padding:20,color:"#888"}}>No orders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container:{ background:"#fff", borderRadius:10, padding:24 },
  filterRow:{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" },
  filterBtn:{ padding:"6px 14px", border:"1px solid #ddd", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:12 },
  tableWrap:{ overflow:"auto" },
  table:{ width:"100%", borderCollapse:"collapse" },
  th:{ background:"#f5f5f5", padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, borderBottom:"1px solid #e0e0e0", whiteSpace:"nowrap" },
  td:{ padding:"10px 14px", fontSize:13, borderBottom:"1px solid #eee", verticalAlign:"top" },
  badge:{ color:"#fff", padding:"3px 10px", borderRadius:10, fontSize:11, fontWeight:600 },
  select:{ padding:"5px 8px", border:"1px solid #ddd", borderRadius:4, fontSize:12 },
};

export default AdminOrders;
