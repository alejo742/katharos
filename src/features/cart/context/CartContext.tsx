"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Cart } from '../types/cart';

interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cart: { items: [], lastUpdated: new Date() },
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartItemsCount: () => 0,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], lastUpdated: new Date() });
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('katharosCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart data from localStorage:', error);
        // Reset cart if there's an error
        setCart({ items: [], lastUpdated: new Date() });
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('katharosCart', JSON.stringify({
      ...cart,
      lastUpdated: new Date() // Update timestamp
    }));
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCart(currentCart => {
      // Check if item already exists in cart
      const existingItemIndex = currentCart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );
      
      let newItems;
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = [...currentCart.items];
        
        // Calculate new quantity (limited by stock)
        const newQuantity = Math.min(
          newItems[existingItemIndex].quantity + item.quantity,
          item.stockQuantity
        );
        
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newQuantity,
          // Update other properties that might have changed
          price: item.price,
          salePrice: item.salePrice,
          stockQuantity: item.stockQuantity
        };
      } else {
        // Item doesn't exist, add it
        newItems = [...currentCart.items, item];
      }
      
      return {
        items: newItems,
        lastUpdated: new Date()
      };
    });
  };
  
  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(currentCart => ({
      items: currentCart.items.filter(item => item.productId !== productId),
      lastUpdated: new Date()
    }));
  };
  
  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    setCart(currentCart => {
      const updatedItems = currentCart.items.map(item => {
        if (item.productId === productId) {
          // Ensure quantity doesn't exceed stock
          const validQuantity = Math.min(Math.max(1, quantity), item.stockQuantity);
          return { ...item, quantity: validQuantity };
        }
        return item;
      });
      
      return {
        items: updatedItems,
        lastUpdated: new Date()
      };
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setCart({ items: [], lastUpdated: new Date() });
  };
  
  // Calculate cart total
  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      const itemPrice = item.salePrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  // Get total number of items in cart
  const getCartItemsCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};