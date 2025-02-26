import React from "react";
import "./styles/ProductDetails.css";
import { useAdminProducts } from "./Context/AdminProductsContext";

function ProductDetails() {
    const { initialData } = useAdminProducts();
    console.log("ProductDetails", initialData);

    if (!initialData) {
        return <p>Loading product details...</p>;
    }

    return (
        <div className="product-details">
            <h1 className="heading">Product Details</h1>
            <h1 className="product-title">{initialData.name}</h1>
            <p className="product-brand"><strong>Brand:</strong> {initialData.brand}</p>
            <p className="product-category"><strong>Category:</strong> {initialData.category}</p>
            <p className="product-gender"><strong>Gender:</strong> {initialData.gender}</p>
            <p className="product-price">
                <strong>Price:</strong> ${initialData.price}
                <span className="original-price"> ${initialData.originalPrice}</span>
                <span className="discount"> ({initialData.discount}% Off)</span>
            </p>
            <p className="product-quantity"><strong>Stock:</strong> {initialData.quantity} available</p>
            <p className="product-description"><strong>Description:</strong>{initialData.description}</p>

            {/* Sizes */}
            {initialData.sizes?.length > 0 && (
                <p className="product-sizes"><strong>Sizes Available:</strong> {initialData.sizes.join(", ")}</p>
            )}

            {/* Colors */}
            {initialData.colors?.length > 0 && (
                <p className="product-colors"><strong>Colors:</strong> {initialData.colors.join(", ")}</p>
            )}

            {/* Color-wise images */}
            <div className="product-images">
                {Object.entries(initialData.colorImages || {}).map(([color, images]) => (
                    <div key={color} className="color-section">
                        <h3>{color}</h3>
                        <div className="image-gallery">
                            {images.map((image, index) => (
                                <img key={index} src={image} alt={`${color} product`} className="product-image" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductDetails;
