// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setCartLoading(true);
    try {
      const { data } = await cartAPI.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartAPI.add(productId, quantity);
    setCart(data);
    return data;
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartAPI.update(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await cartAPI.remove(itemId);
    setCart(data);
  };

  const clearCart = async () => {
    await cartAPI.clear();
    setCart(null);
  };

  const itemCount = cart?.item_count ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, itemCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);