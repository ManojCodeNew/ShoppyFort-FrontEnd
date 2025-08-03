import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import { useProducts } from './ProductsContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WishlistContext = createContext(null);

function WishlistProvider({ children }) {
  const { products } = useProducts();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { token, isAuthenticated, userDataLoaded } = useAuth();
  
  const fetchUserWishlist = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setItems([]); // Clear items when not authenticated
      return;
    }
    
    try {
      const response = await sendGetRequestToBackend('wishlist', token);
      if (response?.wishlist) {
        const userWishlistedProducts = products.filter(product =>
          response.wishlist.some(wishlistItem => wishlistItem.productid === product._id)
        );
        setItems(userWishlistedProducts);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setItems([]);
    }
  }, [token, isAuthenticated, products, navigate]);

  useEffect(() => {
    if (token && isAuthenticated && userDataLoaded) {
      fetchUserWishlist();
    } else if (!isAuthenticated) {
      setItems([]); // Clear wishlist when not authenticated
    }
  }, [token, isAuthenticated, userDataLoaded, fetchUserWishlist])

  const addItem = useCallback(async (item) => {
    if (!token || !isAuthenticated) {
      // Don't redirect, just show notification or handle gracefully
      return;
    }
    await sendPostRequestToBackend('wishlist/addWishlist', { productid: item._id }, token);

    setItems(currentItems => {
      if (currentItems.some(i => i._id === item._id)) return currentItems;
      return [...currentItems, item];
    });

  }, [token, isAuthenticated, navigate]);

  const removeItem = useCallback(async (id) => {
    if (!token || !isAuthenticated) {
      // Don't redirect, just show notification or handle gracefully
      return;
    }

    await sendPostRequestToBackend('wishlist/removeWishlist', { productid: id }, token);
    setItems(currentItems => currentItems.filter(item => item._id !== id));
  }, [token, isAuthenticated, navigate]);

  const isInWishlist = useCallback((id) => {
    return items.some(item => item._id === id);
  }, [items]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      addItem,
      removeItem,
      isInWishlist,
      fetchUserWishlist,
      totalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
export { WishlistProvider, useWishlist };