import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import '../styles/components/product-card.scss';
import heart from "../assets/Images/heart.png";
import activeHeart from "../assets/Images/active.png";

const ProductCard = ({ product }) => {
  const [showAddToBag, setShowAddToBag] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const {
    _id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    colors,
    defaultImg
  } = product;

  const handleProductClick = (e) => {
    e.preventDefault();
    // Prevent navigation if clicking on wishlist or add to bag buttons
    if (e.target.closest('.wishlist-button') || e.target.closest('.add-to-bag')) {
      return;
    }
    navigate(`/product/view/${_id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isInWishlist(_id)) {
      removeFromWishlist(_id);
    } else {
      addToWishlist({
        _id,
        name,
        brand,
        price,
        originalPrice,
        discount,
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
          src={imageError ? fallbackImage : defaultImg}
          alt={name}
          onError={handleImageError}
          className='img'
        />
        {discount > 0 && (
          <span className="discount-tag">{discount}% OFF</span>
        )}
        <button
          className={`wishlist-button ${isInWishlist(_id) ? 'active' : ''}`}
          onClick={handleWishlistToggle}
        >

          <img src={isInWishlist(_id) ? activeHeart : heart} alt="wishlist" className='heart-icon' /> :
        </button>
      </div>

      <div className="product-card-info">
        <h3 className="brand">{name.length > 15 ? name.slice(0, 13) + "..." : name}</h3>
        <p className="name">{brand.length > 15 ? brand.slice(0, 13) + "..." : brand}</p>
        <div className="price-info">
          <span className="current-price"><small className="currency-label">AED</small>{price}</span>
          {originalPrice && (
            <span className="original-price"> <small className="currency-label">AED</small>{originalPrice}</span>
          )}
          {/* {discount > 0 && (
            <span className="discount">({discount}% OFF)</span>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;