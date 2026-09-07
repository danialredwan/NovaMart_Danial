import { useState, useEffect } from "react";
import api from "../../utils/api";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => { api.get("/orders/vendor/orders").then(r => setOrders(r.data)).catch(() => {}); }, []);

  const updateStatus = async (orderId, orderStatus, trackingNote) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus, trackingNote });
      const { data } = await api.get("/orders/vendor/orders");
      setOrders(data);
    } catch (err) { alert(err.response?.data?.message); }
  };

  const statusOptions = ["pending","processing","shipped","delivered"];
  const statusColors = { pending:"#ff9800", processing:"#2196f3", shipped:"#9c27b0", delivered:"#4caf50", cancelled:"#e53935" };

  return (
    <div>
      <h2>Customer Orders</h2>
      {orders.length === 0 && <p style={{color:"#888"}}>No orders yet.</p>}
      {orders.map(order => (
        <div key={order._id} style={styles.orderCard}>
          <div style={styles.orderHeader}>
            <div>
              <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
              <span style={{marginLeft:10, color:"#888", fontSize:13}}>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{...styles.badge, background: statusColors[order.orderStatus]}}>{order.orderStatus}</span>
              <strong style={{color:"#e53935"}}>৳{order.finalPrice}</strong>
            </div>
          </div>
          <p style={{margin:"6px 0", fontSize:13, color:"#555"}}>Customer: {order.customer?.name} ({order.customer?.email})</p>

          {/* Items */}
          {order.items?.map(item => (
            <div key={item._id} style={styles.itemRow}>
              <img src={item.product?.images?.[0]||"https://via.placeholder.com/40"} alt="" style={styles.itemImg} />
              <span style={{flex:1, fontSize:13}}>{item.product?.name}</span>
              <span style={{fontSize:13}}>× {item.quantity} = ৳{(item.price*item.quantity).toFixed(2)}</span>
            </div>
          ))}

          {/* Status updater */}
          {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
            <div style={styles.updateRow}>
              <select defaultValue={order.orderStatus} id={`status-${order._id}`} style={styles.select}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input id={`note-${order._id}`} placeholder="Add tracking note..." style={styles.noteInput} defaultValue={order.trackingNote||""} />
              <button onClick={() => updateStatus(order._id, document.getElementById(`status-${order._id}`).value, document.getElementById(`note-${order._id}`).value)} style={styles.updateBtn}>Update</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  orderCard: { background:"#fff", borderRadius:8, padding:16, marginBottom:14, border:"1px solid #e0e0e0" },
  orderHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  badge: { color:"#fff", padding:"3px 12px", borderRadius:12, fontSize:12, fontWeight:600 },
  itemRow: { display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid #f0f0f0" },
  itemImg: { width:40, height:40, objectFit:"cover", borderRadius:4 },
  updateRow: { display:"flex", gap:8, marginTop:10, alignItems:"center" },
  select: { padding:"7px 10px", border:"1px solid #ddd", borderRadius:6, fontSize:13 },
  noteInput: { flex:1, padding:"7px 12px", border:"1px solid #ddd", borderRadius:6, fontSize:13 },
  updateBtn: { background:"#1976d2", color:"#fff", border:"none", padding:"7px 16px", borderRadius:6, cursor:"pointer", fontWeight:600 },
};

export default VendorOrders;
