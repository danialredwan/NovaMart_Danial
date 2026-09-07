import axios from "axios";

// A pre-configured axios instance so we don't repeat the base URL everywhere.
// Every API call in the app will use this instead of plain axios.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor: before every request, attach the JWT token from localStorage if it exists.
// This way we don't need to manually add the Authorization header in every file.
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("novamartUser"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
