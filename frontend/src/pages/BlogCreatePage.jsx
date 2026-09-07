import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", image: "", tags: "" });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // data.url = "/uploads/filename.jpg"
      const fullUrl = `http://localhost:5000${data.url}`;
      setForm(prev => ({ ...prev, image: fullUrl }));
    } catch (err) {
      alert("Image upload failed: " + (err.response?.data?.message || err.message));
      setPreview("");
      setForm(prev => ({ ...prev, image: "" }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    setForm(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      await api.post("/blogs", { ...form, tags: tagsArray });
      navigate("/blogs");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Write a Blog Post</h2>
      <form onSubmit={handleSubmit}>

        <label style={styles.label}>Title *</label>
        <input
          style={styles.input}
          required
          placeholder="Enter post title..."
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        {/* Cover Image Upload */}
        <label style={styles.label}>Cover Image</label>
        {!preview ? (
          <label style={styles.uploadZone}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <div style={styles.uploadIcon}>🖼️</div>
            <p style={styles.uploadText}>Click to upload image from your PC</p>
            <p style={styles.uploadHint}>JPG, PNG, WebP — max 5MB</p>
          </label>
        ) : (
          <div style={styles.previewWrap}>
            <img src={preview} alt="Cover preview" style={styles.previewImg} />
            <div style={styles.previewOverlay}>
              {uploading ? (
                <span style={styles.uploadingBadge}>⏳ Uploading...</span>
              ) : (
                <span style={styles.uploadedBadge}>✓ Uploaded</span>
              )}
              <button type="button" onClick={removeImage} style={styles.removeBtn}>
                ✕ Remove
              </button>
            </div>
          </div>
        )}

        <label style={styles.label}>Tags (comma separated)</label>
        <input
          style={styles.input}
          placeholder="e.g. electronics, review, tips"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />

        <label style={styles.label}>Content *</label>
        <textarea
          style={{ ...styles.input, height: 240, resize: "vertical" }}
          required
          placeholder="Write your blog post here..."
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: uploading ? 0.6 : 1 }}
            disabled={uploading}
          >
            {uploading ? "Uploading image..." : "Publish Post"}
          </button>
          <button type="button" onClick={() => navigate("/blogs")} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { background: "#fff", borderRadius: 10, padding: 28, maxWidth: 700, margin: "0 auto" },
  heading: { fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#555" },
  input: { width: "100%", padding: "9px 12px", marginBottom: 16, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  uploadZone: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    border: "2px dashed #c7d2fe", borderRadius: 10, padding: "32px 16px", marginBottom: 16,
    cursor: "pointer", background: "#f8faff", transition: "border-color 0.2s",
  },
  uploadIcon: { fontSize: 36, marginBottom: 8 },
  uploadText: { margin: 0, fontWeight: 600, color: "#4f46e5", fontSize: 14 },
  uploadHint: { margin: "4px 0 0", color: "#94a3b8", fontSize: 12 },
  previewWrap: { position: "relative", marginBottom: 16, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" },
  previewImg: { width: "100%", maxHeight: 280, objectFit: "cover", display: "block" },
  previewOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "8px 12px",
  },
  uploadingBadge: { color: "#fde68a", fontSize: 13, fontWeight: 600 },
  uploadedBadge: { color: "#6ee7b7", fontSize: 13, fontWeight: 600 },
  removeBtn: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 },
  submitBtn: { background: "#1976d2", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  cancelBtn: { background: "#e0e0e0", color: "#333", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
};

export default BlogCreatePage;
