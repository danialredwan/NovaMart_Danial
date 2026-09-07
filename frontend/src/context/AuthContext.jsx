import { createContext, useContext, useState } from "react";
import api from "../utils/api";

// Create the context
const AuthContext = createContext();

// AuthProvider wraps the whole app so any component can access auth state
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so the user stays logged in on page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("novamartUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [error, setError] = useState("");

  // Register a new user
  const register = async (formData) => {
    setError("");
    try {
      const { data } = await api.post("/auth/register", formData);
      localStorage.setItem("novamartUser", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  // Login with email + password
  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("novamartUser", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  // Logout — remove from state and localStorage
  const logout = () => {
    localStorage.removeItem("novamartUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — components use this instead of useContext(AuthContext) directly
export const useAuth = () => useContext(AuthContext);
