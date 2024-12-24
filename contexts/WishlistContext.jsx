import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import { jwtDecode } from 'jwt-decode';
import { useProducts } from './ProductsContext.jsx';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from './AuthContext.jsx';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { products } = useProducts();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('user');
  const user = token ? jwtDecode(token) : null;


  const fetchUserWishlist = useCallback(async () => {
    if (!user) {
      return
    } else {
      const response = await sendGetRequestToBackend(`wishlist/${user.id}`);
      if (response && response.wishlist) {
        const userWishlistedProducts = products.filter(product =>
          response.wishlist.some(wishlistItem => wishlistItem.productid === product._id)
        );
        setItems(userWishlistedProducts);
      }
    }
  }, [user, products]);
  
  useEffect(() => {
    if (user) {
      fetchUserWishlist();
    } 
  }, [user, fetchUserWishlist])

  const addItem = useCallback(async (item) => {
    if (user) {
      const response = await sendPostRequestToBackend('wishlist/addWishlist', { userid: user.id, productid: item._id });
      setItems(currentItems => {
        if (currentItems.some(i => i._id === item._id)) return currentItems;
        return [...currentItems, item];
      });
    } else {
      navigate("/login");
    }


  }, []);

  const removeItem = useCallback(async (id) => {
    const response = await sendPostRequestToBackend('wishlist/removeWishlist', { userid: user.id, productid: id });
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

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

export function useWishlist() {

  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}