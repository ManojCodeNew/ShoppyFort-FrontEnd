import React, { useState } from "react";
import "./styles/ProductDetails.css";
import { useAdminProducts } from "./Context/AdminProductsContext";

function ProductDetails() {
    const { initialData } = useAdminProducts();
    const [selectedImageIndex, setSelectedImageIndex] = useState({});
    const [lightboxImage, setLightboxImage] = useState(null);
    
    if (!initialData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading product details...</p>
            </div>
        );
    }

    const handleImageClick = (color, index) => {
        setSelectedImageIndex(prev => ({ ...prev, [color]: index }));
    };

    const openLightbox = (imageUrl) => {
        setLightboxImage(imageUrl);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    return (
        <div className="product-details">
            <div className="product-header">
                <div className="badge-container">
                    <span className="category-badge">{initialData.category}</span>
                    {initialData.discount && (
                        <span className="discount-badge">{initialData.discount}% OFF</span>
                    )}
                </div>
                <h1 className="product-title">{initialData.name}</h1>
                <p className="product-brand">{initialData.brand}</p>
            </div>

            <div className="product-content">
                <div className="product-info-grid">
                    <div className="info-card">
                        <div className="info-icon">💰</div>
                        <div className="info-content">
                            <span className="info-label">Price</span>
                            <div className="price-container">
                                <span className="current-price">${initialData.price}</span>
                                {initialData.originalPrice && (
                                    <span className="original-price">${initialData.originalPrice}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">📦</div>
                        <div className="info-content">
                            <span className="info-label">Stock</span>
                            <span className="info-value">{initialData.stock} available</span>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">👥</div>
                        <div className="info-content">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{initialData.gender}</span>
                        </div>
                    </div>
                </div>

                <div className="description-section">
                    <h3>Description</h3>
                    <p className="product-description">{initialData.description}</p>
                </div>

                {initialData.sizes?.length > 0 && (
                    <div className="attributes-section">
                        <h3>Available Sizes</h3>
                        <div className="size-chips">
                            {initialData.sizes.map((size, index) => (
                                <span key={index} className="size-chip">{size}</span>
                            ))}
                        </div>
                    </div>
                )}

                {initialData.colors?.length > 0 && (
                    <div className="attributes-section">
                        <h3>Available Colors</h3>
                        <div className="color-chips">
                            {initialData.colors.map((color, index) => (
                                <span key={index} className="color-chip">{color}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="images-section">
                    <h3>Product Images</h3>
                    {Object.entries(initialData.colorImages || {}).map(([color, images]) => (
                        <div key={color} className="color-gallery">
                            <div className="color-header">
                                <h4>{color}</h4>
                                <span className="image-count">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="main-image-container">
                                <img 
                                    src={images[selectedImageIndex[color] || 0]} 
                                    alt={`${color} product main`} 
                                    className="main-product-image"
                                    onClick={() => openLightbox(images[selectedImageIndex[color] || 0])}
                                />
                            </div>

                            {images.length > 1 && (
                                <div className="thumbnail-gallery">
                                    {images.map((image, index) => (
                                        <img 
                                            key={index} 
                                            src={image} 
                                            alt={`${color} product thumbnail ${index + 1}`} 
                                            className={`thumbnail-image ${(selectedImageIndex[color] || 0) === index ? 'active' : ''}`}
                                            onClick={() => handleImageClick(color, index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {lightboxImage && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content">
                        <img src={lightboxImage} alt="Product enlarged" className="lightbox-image" />
                        <button className="lightbox-close" onClick={closeLightbox}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;