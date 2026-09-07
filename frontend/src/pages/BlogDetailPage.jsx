import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BlogDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => { api.get(`/blogs/${id}`).then(r => setBlog(r.data)).catch(() => {}); }, [id]);

  const deleteBlog = async () => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/blogs/${id}`);
    navigate("/blogs");
  };

  if (!blog) return <p style={{textAlign:"center",padding:40}}>Loading...</p>;

  const isAuthor = user?._id === blog.author?._id;

  return (
    <div style={styles.container}>
      {blog.image && <img src={blog.image} alt={blog.title} style={styles.heroImg} />}
      <div style={styles.meta}>
        <span style={styles.author}>by {blog.author?.name}</span>
        <span style={styles.date}>{new Date(blog.createdAt).toLocaleDateString()}</span>
      </div>
      <h1 style={styles.title}>{blog.title}</h1>
      {blog.tags?.length > 0 && (
        <div style={styles.tagRow}>
          {blog.tags.map(t => <span key={t} style={styles.tag}>#{t}</span>)}
        </div>
      )}
      <div style={styles.content}>{blog.content}</div>
      {(isAuthor || user?.role === "admin") && (
        <div style={styles.actions}>
          <button onClick={deleteBlog} style={styles.deleteBtn}>Delete Post</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24, maxWidth:760, margin:"0 auto" },
  heroImg: { width:"100%", maxHeight:320, objectFit:"cover", borderRadius:8, marginBottom:16 },
  meta: { display:"flex", gap:16, color:"#888", fontSize:13, marginBottom:8 },
  author: { fontWeight:600 },
  date: {},
  title: { fontSize:26, fontWeight:700, margin:"0 0 12px", color:"#1a1a1a" },
  tagRow: { display:"flex", gap:6, marginBottom:16 },
  tag: { background:"#e3f2fd", color:"#1565c0", padding:"2px 10px", borderRadius:10, fontSize:12 },
  content: { fontSize:15, lineHeight:1.8, color:"#333", whiteSpace:"pre-wrap" },
  actions: { marginTop:20, paddingTop:16, borderTop:"1px solid #eee" },
  deleteBtn: { background:"#e53935", color:"#fff", border:"none", padding:"8px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
};

export default BlogDetailPage;
