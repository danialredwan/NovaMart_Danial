import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any route that needs login.
// If "roles" prop is provided, also checks that the user has one of those roles.
// Usage: <ProtectedRoute roles={["admin"]}> <AdminDashboard /> </ProtectedRoute>
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
