import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import '../styles/components/product-card.scss';

const ProductCard = ({ product }) => {
  const [showAddToBag, setShowAddToBag] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  
  const {
    id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    image,
    category,
    gender
  } = product;

  const handleProductClick = (e) => {
    // Prevent navigation if clicking on wishlist or add to bag buttons
    if (e.target.closest('.wishlist-button') || e.target.closest('.add-to-bag')) {
      return;
    }
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      id,
      name,
      brand,
      price,
      image,
      quantity: 1
    });
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        name,
        brand,
        price,
        originalPrice,
        discount,
        image
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800';

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setShowAddToBag(true)}
      onMouseLeave={() => setShowAddToBag(false)}
      onClick={handleProductClick}
    >
      <div className="product-image">
        <img 
          src={imageError ? fallbackImage : image} 
          alt={name}
          onError={handleImageError}
        />
        {discount > 0 && (
          <span className="discount-tag">{discount}% OFF</span>
        )}
        <button 
          className={`wishlist-button ${isInWishlist(id) ? 'active' : ''}`}
          onClick={handleWishlistToggle}
        >
          <Heart className="heart-icon" />
        </button>
        
        {showAddToBag && (
          <button 
            className="add-to-bag"
            onClick={handleAddToCart}
          >
            <ShoppingBag />
            <span>ADD TO BAG</span>
          </button>
        )}
      </div>

      <div className="product-info">
        <h3 className="brand">{brand}</h3>
        <p className="name">{name}</p>
        <div className="price-info">
          <span className="current-price">₹{price}</span>
          {originalPrice && (
            <span className="original-price">₹{originalPrice}</span>
          )}
          {discount > 0 && (
            <span className="discount">({discount}% OFF)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;