import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import {  ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import sendGetRequestToBackend from '../components/Request/Get.jsx';
import '../styles/pages/product-view-page.scss';
import heart from '../assets/Images/heartgreen.png';
import ActiveHeartBtn from '../assets/Images/active.png';
import ShoppingBag from '../assets/Images/bagwhite.png';
import { useProducts } from '@/contexts/ProductsContext';
const ProductViewPage = () => {
  const { id } = useParams();
  const { products } = useProducts();


  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState();

  // Product Image displaying state
  const [productImage, setProductImage] = useState();

  console.log("View Page", product);
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // const productId = id;

    const fetchProduct = async () => {
      try {
        // const foundProduct = await sendGetRequestToBackend('');
        // const filteredProduct = foundProduct.find(p => p._id === productId);

        const filteredProduct = products.find(p => p._id === id);
        if (filteredProduct) {
          setProduct(filteredProduct);
          const defaultColor = filteredProduct.colors[0];
          setProductImage(filteredProduct.colorImages[defaultColor][0]);
          setSelectedColor(defaultColor);

        } else {
          navigate('/');
        }
      } catch (error) {
        console.log('Error fetching product:', error);
      }
    };
    fetchProduct()
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
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    const selections = {};

    if (selectedColor) selections.color = selectedColor;
    if (selectedSize) selections.size = selectedSize;

    addToCart({
      ...product,
      quantity: 1
    }, selections);
  };



  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }

  };
  const fallbackImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-layout">

          <div className="product-image">
            <img src={productImage} alt="Product Image" className='product-image-img' />

            <div className="product-gallery">

              {product.colorImages[selectedColor].map((image, index) => (
                <img key={index} src={image ? image : fallbackImage} alt={`${product.name} - View ${index + 1} `} className={productImage === image ? 'active' : ''} onClick={() => setProductImage(image)} />
              ))}
            </div>
          </div>

          <div className="product-view-page-info">
            <h1 className="product-brand">{product.brand} </h1>
            <h2 className="product-name">{product.name} </h2>

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
                      onClick={() => {
                        setSelectedColor(color)
                        setProductImage(product.colorImages[color][0]);
                      }}
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
                <img src={ShoppingBag} alt="shopping bag" className='shoppingbag-icon' />
                {/* <ShoppingBag /> */}
                Add to Bag
              </button>
              <button
                className={`btn-secondary wishlist${isInWishlist(product._id) ? 'active' : ''}`}
                onClick={handleWishlistToggle}
              >
                {
                  isInWishlist(product._id) ?
                    <img src={ActiveHeartBtn} alt="" className='heart-icon' />
                    :
                    <img src={heart} alt="" className='heart-icon' />
                }
                {isInWishlist(product._id) ? 'Wishlisted' : 'Wishlist'}
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

export default ProductViewPage;