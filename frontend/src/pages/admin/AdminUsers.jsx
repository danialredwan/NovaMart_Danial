import { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    const q = filter !== "all" ? `?role=${filter}` : "";
    const { data } = await api.get(`/admin/users${q}`);
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const approveVendor = async (id) => {
    await api.put(`/admin/users/${id}/approve`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const badgeColors = { customer:"#e3f2fd", vendor:"#f3e5f5", admin:"#e8f5e9" };

  return (
    <div style={styles.container}>
      <h2>User Management</h2>
      <div style={styles.filterRow}>
        {["all","customer","vendor","admin"].map(r => (
          <button key={r} onClick={()=>setFilter(r)} style={{...styles.filterBtn, background: filter===r?"#1976d2":"#fff", color: filter===r?"#fff":"#333"}}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
        ))}
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>{["Name","Email","Role","Status","Loyalty","Actions"].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}><span style={{...styles.roleBadge, background: badgeColors[u.role]}}>{u.role}</span></td>
                <td style={styles.td}>{u.role==="vendor" ? (u.isApproved ? <span style={{color:"green",fontWeight:600}}>✓ Approved</span> : <span style={{color:"orange",fontWeight:600}}>⏳ Pending</span>) : "—"}</td>
                <td style={styles.td}>{u.role==="customer" ? `${u.loyaltyPoints}pts · ${u.loyaltyBadge}` : "—"}</td>
                <td style={styles.td}>
                  {u.role==="vendor" && !u.isApproved && <button onClick={()=>approveVendor(u._id)} style={styles.approveBtn}>Approve</button>}
                  <button onClick={()=>deleteUser(u._id)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length===0 && <tr><td colSpan={6} style={{textAlign:"center",padding:24,color:"#888"}}>No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24 },
  filterRow: { display:"flex", gap:8, marginBottom:16 },
  filterBtn: { padding:"7px 16px", border:"1px solid #ddd", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:13 },
  tableWrap: { overflow:"auto" },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { background:"#f5f5f5", padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, borderBottom:"1px solid #e0e0e0", whiteSpace:"nowrap" },
  td: { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #eee" },
  roleBadge: { padding:"2px 10px", borderRadius:10, fontSize:11, fontWeight:600 },
  approveBtn: { background:"#e8f5e9", color:"#2e7d32", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600, marginRight:4 },
  deleteBtn: { background:"#ffebee", color:"#c62828", border:"none", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontWeight:600 },
};

export default AdminUsers;
