import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { products } from '../data/products';
import '../styles/pages/product-page.scss';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  // Product Image displaying state
  const [productImage, setProductImage] = useState();


  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const productId = parseInt(id);
    const foundProduct = products.find(p => p.id === productId);

    if (foundProduct) {
      setProduct(foundProduct);
      setProductImage(foundProduct.image);
    } else {
      navigate('/'); // Redirect to home if product not found
    }
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart({
      ...product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });
  };



  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }

  };


  return (
    <div className="product-page">
      <div className="container">
        <div className="product-layout">

          <div className="product-image">
            <img src={productImage} alt="Product Image" />

            <div className="product-gallery">
              {product.images.map((image, index) => (
                <img key={index} src={image} alt={`${product.name} - View ${index + 1}`} onClick={()=>setProductImage(image)}/>
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-brand">{product.brand}</h1>
            <h2 className="product-name">{product.name}</h2>

            <div className="product-price">
              <span className="current-price">₹{product.price}</span>
              <span className="original-price">₹{product.originalPrice}</span>
              <span className="discount">({product.discount}% OFF)</span>
            </div>

            <div className="product-options">
              <div className="size-selector">
                <h3>Select Size</h3>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="color-selector">
                <h3>Select Color</h3>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-actions">
              <button
                className="add-to-bag btn-primary"
                onClick={handleAddToCart}
              >
                <ShoppingBag />
                Add to Bag
              </button>
              <button
                className={`btn-secondary wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart />
                {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            <div className="product-description">
              <h3>Product Details</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;