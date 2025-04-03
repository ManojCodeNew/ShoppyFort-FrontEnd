import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import {  ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import sendGetRequestToBackend from '../components/Request/Get.jsx';
import '../styles/pages/product-view-page.scss';
import heart from '../assets/Images/heartgreen.png';
import ActiveHeartBtn from '../assets/Images/active.png';
import ShoppingBag from '../assets/Images/bagwhite.png';
import { useProducts } from '@/contexts/ProductsContext.jsx';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
const ProductViewPage = () => {
  const { id } = useParams();
  const { products } = useProducts();


  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState();
  const { showNotification } = useNotification();
  // Product Image displaying state
  const [productImage, setProductImage] = useState();

  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setProduct(null);

    const fetchProduct = async () => {
      try {
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
        showNotification(`Error fetching product: ${error}`, "error");
      }
    };
    fetchProduct()
  }, [id, navigate, products]);

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
      showNotification('Please select a size', "error");
      return;
    }
    if (!selectedColor) {
      showNotification('Please select a color', "error");
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
  const fallbackImage = 'https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-6f08-51f7-b6ec-c58003fd17aa/raw?se=2025-03-30T15%3A23%3A57Z&sp=r&sv=2024-08-04&sr=b&scid=944cb68e-fe60-5752-a04c-4ff2474237ed&skoid=fa7966e7-f8ea-483c-919a-13acfd61d696&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-03-30T13%3A34%3A20Z&ske=2025-03-31T13%3A34%3A20Z&sks=b&skv=2024-08-04&sig=5eof3pHpGOQfYNahuDmm0nPDVOqE2iXplkSjrOXwz0I%3D';

  return (
    <div className="product-view-page">
      <div className="product-view-page-container">
        <div className="product-view-page-layout">

          <div className="product-view-page-image">
            <img src={productImage || fallbackImage} alt="Product Image" className='product-view-page-image-img' />

            <div className="product-view-page-gallery">

              {product.colorImages[selectedColor]?.map((image, index) => (
                <img key={index} src={image || fallbackImage} alt={`${product.name} - View ${index + 1} `} className={productImage === image ? 'active' : ''} onClick={() => setProductImage(image)} />
              ))}
            </div>
          </div>

          <div className="product-view-page-info">
            <h1 className="product-view-page-brand">{product.brand} </h1>
            <h2 className="product-view-page-name">{product.name} </h2>

            <div className="product-view-page-price">
              <span className="product-view-page-current-price">₹{product.price}</span>
              <span className="product-view-page-original-price">₹{product.originalPrice}</span>
              <span className="product-view-page-discount">({product.discount}% OFF)</span>
            </div>

            <div className="product-view-page-options">
              <div className="product-view-page-size-selector">
                <h3>Select Size</h3>
                <div className="product-view-page-size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`product-view-page-size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-view-page-color-selector">
                <h3>Select Color</h3>
                <div className="product-view-page-color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`product-view-page-color-option ${selectedColor === color ? 'selected' : ''}`}
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

            <div className="product-view-page-actions">
              <button
                className="product-view-page-add-to-bag btn-primary"
                onClick={handleAddToCart}
              >
                <img src={ShoppingBag} alt="shopping bag" className='product-view-page-shoppingbag-icon' />
                {/* <ShoppingBag /> */}
                Add to Bag
              </button>
              <button
                className={`product-view-page-btn-secondary wishlist ${isInWishlist(product._id) ? 'active' : ''}`}
                onClick={handleWishlistToggle}
              >
                {
                  isInWishlist(product._id) ?
                    <img src={ActiveHeartBtn} alt="" className='product-view-page-heart-icon' />
                    :
                    <img src={heart} alt="" className='product-view-page-heart-icon' />
                }
                {isInWishlist(product._id) ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            <div className="product-view-page-description">
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