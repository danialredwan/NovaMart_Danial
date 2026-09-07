import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user?.role === "customer") {
      fetchCartCount();
      fetchWishlistCount();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const { data } = await api.get("/cart");
      setCartCount(data.items?.length || 0);
    } catch {
      setCartCount(0);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const { data } = await api.get("/wishlist");
      setWishlistCount(data.products?.length || 0);
    } catch {
      setWishlistCount(0);
    }
  };

  const refreshCart = () => {
    if (user?.role === "customer") fetchCartCount();
  };

  const refreshWishlist = () => {
    if (user?.role === "customer") fetchWishlistCount();
  };

  return (
    <CartContext.Provider value={{ cartCount, wishlistCount, refreshCart, refreshWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
