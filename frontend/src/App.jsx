import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PromoBanner from "./components/PromoBanner";

// Customer pages
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import BlogCreatePage from "./pages/BlogCreatePage";
import VendorShopPage from "./pages/VendorShopPage";

// Vendor pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorSubscription from "./pages/vendor/VendorSubscription";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <PromoBanner />
          <div className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/:id" element={<BlogDetailPage />} />
              <Route path="/shop/:vendorId" element={<VendorShopPage />} />

              {/* Customer */}
              <Route path="/cart" element={<ProtectedRoute roles={["customer"]}><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute roles={["customer"]}><CheckoutPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute roles={["customer"]}><WishlistPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute roles={["customer"]}><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute roles={["customer"]}><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/blogs/create" element={<ProtectedRoute><BlogCreatePage /></ProtectedRoute>} />

              {/* Vendor */}
              <Route path="/vendor/dashboard" element={<ProtectedRoute roles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
              <Route path="/vendor/products" element={<ProtectedRoute roles={["vendor"]}><VendorProducts /></ProtectedRoute>} />
              <Route path="/vendor/orders" element={<ProtectedRoute roles={["vendor"]}><VendorOrders /></ProtectedRoute>} />
              <Route path="/vendor/analytics" element={<ProtectedRoute roles={["vendor"]}><VendorAnalytics /></ProtectedRoute>} />
              <Route path="/vendor/subscription" element={<ProtectedRoute roles={["vendor"]}><VendorSubscription /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute roles={["admin"]}><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/discounts" element={<ProtectedRoute roles={["admin"]}><AdminDiscounts /></ProtectedRoute>} />
              <Route path="/admin/refunds" element={<ProtectedRoute roles={["admin"]}><AdminRefunds /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminOrders /></ProtectedRoute>} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
