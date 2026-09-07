import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const { user }                        = useAuth();
  const location                        = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState("");
  const messagesEndRef                    = useRef(null);
  const didAutoSelect                     = useRef(false);

  // Join personal socket room
  useEffect(() => {
    if (!user) return;
    socket.emit("joinRoom", user._id);
    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.off("receiveMessage"); };
  }, [user]);

  // Load conversation list
  useEffect(() => {
    api.get("/chat/conversations/list")
      .then(r => setConversations(r.data))
      .catch(() => {});
  }, []);

  // Auto-select vendor passed from ProductDetail ("Message Vendor" button)
  useEffect(() => {
    if (didAutoSelect.current) return;
    const withUser = location.state?.withUser;
    if (!withUser?._id) return;

    didAutoSelect.current = true;

    // Fetch full user info then open chat
    api.get(`/auth/user/${withUser._id}`)
      .then(r => selectUser(r.data))
      .catch(() => {
        // Fallback: use the info we already have from navigation state
        selectUser(withUser);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Load messages when a user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      api.get(`/chat/${selectedUser._id}`)
        .then(r => setMessages(r.data))
        .catch(() => {});
    }
  }, [selectedUser]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectUser = (u) => {
    setSelectedUser(u);
    // Add to conversations list if not already there
    setConversations(prev => {
      const exists = prev.some(c => c.user._id === u._id || c.user._id === u._id?.toString());
      if (exists) return prev;
      return [{ user: u, lastMessage: "", lastTime: new Date(), unread: 0 }, ...prev];
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: newMessage,
    });
    setNewMessage("");
  };

  const displayName = (u) => u?.storeName || u?.name || "Unknown";
  const avatarLetter = (u) => (u?.storeName || u?.name || "?").charAt(0).toUpperCase();

  return (
    <div style={styles.container}>
      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
        <h3 style={styles.sideTitle}>Messages</h3>

        {conversations.length === 0 ? (
          <p style={styles.emptyNote}>
            No conversations yet. Click "Message Vendor" on any product to start a chat.
          </p>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.user._id}
              onClick={() => selectUser(conv.user)}
              style={{
                ...styles.convItem,
                background: selectedUser?._id === conv.user._id ? "#e0e7ff" : "transparent",
              }}
            >
              <div style={styles.convAvatar}>{avatarLetter(conv.user)}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={styles.convName}>{displayName(conv.user)}</p>
                <p style={styles.convLast}>{conv.lastMessage || "New conversation"}</p>
              </div>
              {conv.unread > 0 && <span style={styles.unreadBadge}>{conv.unread}</span>}
            </div>
          ))
        )}
      </div>

      {/* ── Chat window ── */}
      <div style={styles.chatWindow}>
        {selectedUser ? (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.convAvatar}>{avatarLetter(selectedUser)}</div>
              <div>
                <strong style={{ fontSize: 15 }}>{displayName(selectedUser)}</strong>
                {selectedUser.role && (
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                    {selectedUser.role === "vendor" ? "Vendor" : "Customer"}
                  </p>
                )}
              </div>
            </div>

            <div style={styles.messagesArea}>
              {messages.length === 0 && (
                <p style={styles.startNote}>Send a message to start the conversation.</p>
              )}
              {messages.map((msg, i) => {
                const isMine =
                  msg.sender?._id === user._id ||
                  msg.sender?._id?.toString() === user._id?.toString() ||
                  msg.sender === user._id;
                return (
                  <div
                    key={i}
                    style={{ ...styles.msgWrapper, justifyContent: isMine ? "flex-end" : "flex-start" }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        background: isMine ? "#6366f1" : "#f1f5f9",
                        color: isMine ? "#fff" : "#1e293b",
                      }}
                    >
                      {msg.message}
                      <div style={styles.msgTime}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={styles.inputRow}>
              <input
                style={styles.msgInput}
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
          </>
        ) : (
          <div style={styles.noChat}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>Select a conversation</p>
              <p style={{ color: "#cbd5e1", fontSize: 13, marginTop: 6 }}>
                Or click "Message Vendor" on any product page to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:    { display: "flex", height: "75vh", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  sidebar:      { width: 260, borderRight: "1px solid #e2e8f0", padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  sideTitle:    { margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#1e293b" },
  emptyNote:    { fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: 0 },
  convItem:     { display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 8, cursor: "pointer" },
  convAvatar:   { width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 },
  convName:     { margin: 0, fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  convLast:     { margin: 0, fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  unreadBadge:  { background: "#ef4444", color: "#fff", borderRadius: "50%", padding: "2px 7px", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  chatWindow:   { flex: 1, display: "flex", flexDirection: "column" },
  chatHeader:   { display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid #e2e8f0", background: "#fafafa" },
  messagesArea: { flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 },
  startNote:    { textAlign: "center", color: "#cbd5e1", fontSize: 13, margin: "auto" },
  msgWrapper:   { display: "flex" },
  bubble:       { maxWidth: "70%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.5 },
  msgTime:      { fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: "right" },
  inputRow:     { display: "flex", gap: 10, padding: 14, borderTop: "1px solid #e2e8f0" },
  msgInput:     { flex: 1, padding: "10px 16px", border: "1.5px solid #e2e8f0", borderRadius: 24, fontSize: 14, outline: "none" },
  sendBtn:      { padding: "10px 22px", background: "linear-gradient(135deg,#6366f1,#4338ca)", color: "#fff", border: "none", borderRadius: 24, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  noChat:       { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" },
};

export default ChatPage;
