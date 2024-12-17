import React, { useEffect,useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import '../styles/pages/wishlist-page.scss';
// import Notification from '@/components/Notification';

const WishlistPage = () => {
  const { items } = useWishlist();


  return (
    <div className="wishlist-page">
  
      <div className="container">
        <h1>My Wishlist ({items.length})</h1>

        {items.length === 0 ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(item => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
    
      </div>
    </div>
  );
};

export default WishlistPage;