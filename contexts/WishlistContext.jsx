import React, { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    setItems(currentItems => {
      if (currentItems.some(i => i.id === item.id)) return currentItems;
      return [...currentItems, item];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

  const isInWishlist = useCallback((id) => {
    return items.some(item => item.id === id);
  }, [items]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      addItem,
      removeItem,
      isInWishlist,
      totalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}