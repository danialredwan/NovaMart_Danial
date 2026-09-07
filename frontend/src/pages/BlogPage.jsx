import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const { user } = useAuth();

  useEffect(() => { api.get("/blogs").then(r => setBlogs(r.data)).catch(() => {}); }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{margin:0}}>Blog & Journal</h2>
        {user && <Link to="/blogs/create" style={styles.writeBtn}>+ Write Post</Link>}
      </div>
      <div style={styles.grid}>
        {blogs.map(blog => (
          <Link to={`/blogs/${blog._id}`} key={blog._id} style={styles.card}>
            {blog.image && <img src={blog.image} alt={blog.title} style={styles.cardImg} />}
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{blog.title}</h3>
              <p style={styles.cardExcerpt}>{blog.content?.substring(0, 120)}...</p>
              <div style={styles.cardMeta}>
                <span style={styles.author}>by {blog.author?.name}</span>
                <span style={styles.date}>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              {blog.tags?.length > 0 && (
                <div style={styles.tagRow}>
                  {blog.tags.map(t => <span key={t} style={styles.tag}>#{t}</span>)}
                </div>
              )}
            </div>
          </Link>
        ))}
        {blogs.length === 0 && <p style={{color:"#888"}}>No blog posts yet. Be the first to write one!</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { background:"#fff", borderRadius:10, padding:24 },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  writeBtn: { background:"#1976d2", color:"#fff", padding:"8px 18px", borderRadius:6, textDecoration:"none", fontWeight:600, fontSize:14 },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 },
  card: { border:"1px solid #e0e0e0", borderRadius:8, overflow:"hidden", textDecoration:"none", color:"#333", transition:"box-shadow .2s" },
  cardImg: { width:"100%", height:160, objectFit:"cover" },
  cardBody: { padding:14 },
  cardTitle: { margin:"0 0 6px", fontSize:16, fontWeight:700 },
  cardExcerpt: { color:"#666", fontSize:13, lineHeight:1.5, margin:"0 0 10px" },
  cardMeta: { display:"flex", justifyContent:"space-between", fontSize:12, color:"#888" },
  author: { fontWeight:600 },
  date: {},
  tagRow: { display:"flex", gap:4, marginTop:8, flexWrap:"wrap" },
  tag: { background:"#e3f2fd", color:"#1565c0", padding:"2px 8px", borderRadius:10, fontSize:11 },
};

export default BlogPage;
