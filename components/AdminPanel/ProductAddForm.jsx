import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminProducts } from './Context/AdminProductsContext';
import ImageUpload from './ImageUpload';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
import './styles/ProductAddForm.css';

const ProductAddForm = () => {
    const [productData, setProductData] = useState({
        name: '',
        brand: '',
        price: '',
        originalPrice: '',
        discount: '',
        description: '',
        category: '',
        gender: 'Others',
        sizes: ['One Size'],
        colors: [],
        stock: ''
    });


    const [categories, setCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState("");
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    // const [previewImgs, setPreviewImgs] = useState({});
    const { postProduct, initialData, updateProduct, products, images } = useAdminProducts();
    // const [imgFiles, setImgFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // Add ref to track if we've initialized the form for editing
    const hasInitialized = useRef(false);
    // Add ref to track the current product being edited
    const currentProductId = useRef(null);

    // Color reordering state
    const [draggedColor, setDraggedColor] = useState(null);
    const [draggedOverColor, setDraggedOverColor] = useState(null);
    const [isDraggingColor, setIsDraggingColor] = useState(false);

    const capitalizeWords = (str) => {
        return str.trim().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    useEffect(() => {
        if (initialData) {
            // If we're editing the same product, update the data
            if (currentProductId.current === initialData._id) {
                return;
                // setProductData(initialData);
            }
            if (!hasInitialized.current) {
                // If we're starting to edit a new product
                setProductData(initialData);
                hasInitialized.current = true;
                currentProductId.current = initialData._id;
            }
        } else {
            // Reset the flag when initialData becomes null (new product mode)
            hasInitialized.current = false;
            currentProductId.current = null;
        }

        // Only update categories from products, don't reset productData
        if (products && products.length > 0) {
            // Extract unique categories
            const uniqueCategories = [
                ...new Set(
                    products
                        .map((p) => p.category)
                        .filter(cat => cat && cat.trim() !== '')
                        .map(cat => capitalizeWords(cat))
                )
            ];
            setCategories(uniqueCategories);
        }
    }, [initialData, products]);

    const handleSubmit = async (e) => {
        console.log("I am in handleSubmit",isSubmitting);
        
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalCategory = productData.category === "Others" ? customCategory.trim() : productData.category;

            if (!finalCategory) {
                showNotification("Please select or enter a category.", "error");
                setIsSubmitting(false);
                return;
            }

            // Validate required fields
            if (!productData.name.trim() || !productData.brand.trim() || !productData.price) {
                showNotification("Please fill in all required fields.", "error");
                setIsSubmitting(false);
                return;
            }

            // If it's a new category, add it to the list
            if (productData.category === "Others" && customCategory.trim() !== "") {
                setCategories((prevCategories) => [...prevCategories, customCategory.trim()]);
            }

            const updatedProductData = {
                ...productData,
                category: finalCategory,
                price: Number(productData.price),
                originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
                discount: productData.discount ? Number(productData.discount) : null,
                stock: Number(productData.stock) || 0
            };
            console.log("Before send to neither postProduct nor updateProduct",updatedProductData);

            if (initialData) {
                await updateProduct(updatedProductData);
                showNotification("Product updated successfully!", "success");
                // Reset the initialization flag after successful update
                hasInitialized.current = false;
                currentProductId.current = null;
            } else {
                console.log("Images state before calling postProduct:", images);
                await postProduct(updatedProductData);
                showNotification("Product added successfully!", "success");
            }

        } catch (error) {
            console.error("Error submitting product:", error);
            showNotification("Error submitting product. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    const onClose = () => {
        // Reset the initialization flag when closing
        hasInitialized.current = false;
        currentProductId.current = null;
        navigate('/admin/');
    }


    const handleAddColor = () => {
        if (color && color.trim() && !productData.colors.includes(color.trim())) {
            setProductData({ ...productData, colors: [...productData.colors, color.trim()] });
            setColor('');
        } else if (productData.colors.includes(color.trim())) {
            showNotification("Color already exists!", "warning");
        }
    };

    const handleAddSize = () => {
        const trimmed = size.trim();
        if (trimmed && !productData.sizes.includes(trimmed)) {
            setProductData({ ...productData, sizes: [...productData.sizes, trimmed] });
            setSize('');
        } else if (productData.sizes.includes(trimmed)) {
            showNotification('Size already exists!', 'warning');
        }
    };

    const handleRemoveColor = (index) => {
        const colorToRemove = productData.colors[index];

        // Check if this color has images in the database
        const hasExistingImages = initialData?.colorImages?.[colorToRemove]?.length > 0;

        if (hasExistingImages) {
            // Show confirmation dialog for colors with existing images
            const confirmed = window.confirm(
                `Are you sure you want to delete "${colorToRemove}"?\n\nThis will permanently delete:\n• All images for this color from S3\n• The color from the database\n\nThis action cannot be undone.`
            );

            if (!confirmed) {
                return;
            }
        }

        const updatedColors = productData.colors.filter((_, i) => i !== index);
        setProductData({ ...productData, colors: updatedColors });

        if (hasExistingImages) {
            showNotification(`"${colorToRemove}" will be removed when you update the product.`, "info");
        } else {
            showNotification(`"${colorToRemove}" removed from the form.`, "success");
        }
    };

    const handleRemoveSize = (index) => {
        const updatedSizes = productData.sizes.filter((_, i) => i !== index);
        setProductData({ ...productData, sizes: updatedSizes });
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    // Color reordering functions
    const handleColorDragStart = useCallback((e, colorName) => {
        setDraggedColor(colorName);
        setIsDraggingColor(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    }, []);

    const handleColorDragEnd = useCallback((e) => {
        e.target.style.opacity = '1';
        setDraggedColor(null);
        setDraggedOverColor(null);
        setIsDraggingColor(false);
    }, []);

    const handleColorDragOver = useCallback((e, colorName) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverColor(colorName);
    }, []);

    const handleColorDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggedOverColor(null);
        }
    }, []);

    const handleColorDrop = useCallback((e, targetColorName) => {
        e.preventDefault();

        if (!draggedColor || draggedColor === targetColorName) {
            return;
        }

        const colors = [...productData.colors];
        const sourceIndex = colors.indexOf(draggedColor);
        const targetIndex = colors.indexOf(targetColorName);

        if (sourceIndex === -1 || targetIndex === -1) return;

        // Reorder the colors
        const [movedColor] = colors.splice(sourceIndex, 1);
        colors.splice(targetIndex, 0, movedColor);

        setProductData(prevData => ({
            ...prevData,
            colors: colors
        }));

        if (targetIndex === 0) {
            showNotification(`Color "${movedColor}" moved to first position. It will become the default color.`, "success");
        } else {
            showNotification(`Color "${movedColor}" moved to position ${targetIndex + 1}`, "success");
        }
    }, [draggedColor, productData.colors, showNotification]);

    return (
        <div className="product-form">
            <div className="form-header">
                <div>
                    <h2>{initialData ? 'Edit Product' : 'Add Product'}</h2>
                    {initialData && (
                        <p style={{
                            fontSize: '14px',
                            color: '#666',
                            margin: '5px 0 0 0',
                            fontStyle: 'italic'
                        }}>
                            Product ID: {initialData.productid || 'N/A'}
                        </p>
                    )}
                </div>
                <button type="button" className="close-btn" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            value={productData.name}
                            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                            placeholder="Enter product name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Brand *</label>
                        <input
                            type="text"
                            value={productData.brand}
                            onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                            placeholder="Enter brand name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Price *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productData.price}
                            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                            placeholder="Enter price"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Original Price</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productData.originalPrice}
                            onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                            placeholder="Enter original price"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Discount (%)</label>
                        <input
                            type="number"
                            value={productData.discount}
                            onChange={(e) => setProductData({ ...productData, discount: e.target.value })}
                            placeholder="Enter discount percentage"
                            min="0"
                            max="100"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender *</label>
                        <select
                            value={productData.gender}
                            onChange={(e) => setProductData({ ...productData, gender: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select Gender</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            value={productData.category}
                            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat}
                                </option>
                            ))}
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    {/* Custom Category Input */}
                    {productData.category === "Others" && (
                        <div className="form-group">
                            <label>Enter Custom Category *</label>
                            <input
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Enter new category"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    <div className="form-group full-width">
                        <label>Stock Quantity *</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Enter quantity"
                            value={productData.stock !== undefined ? String(productData.stock) : ''}
                            onChange={(e) => setProductData(prevData => ({
                                ...prevData,
                                stock: Number(e.target.value) || 0
                            }))}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea
                        value={productData.description}
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                        placeholder="Enter product description"
                        rows="4"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="attributes-section">
                    <h3>Product Attributes</h3>

                    <div className="attribute-group">
                        <div className="attribute-input">
                            <label>Colors</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="Enter color (e.g., red, blue)"
                                    onKeyPress={(e) => handleKeyPress(e, handleAddColor)}
                                    disabled={isSubmitting}
                                />
                                <button type="button" onClick={handleAddColor} disabled={isSubmitting}>
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="attribute-display">
                            {productData.colors.map((item, index) => (
                                <span
                                    key={index}
                                    className="attribute-tag"
                                    draggable
                                    onDragStart={(e) => handleColorDragStart(e, item)}
                                    onDragEnd={handleColorDragEnd}
                                    onDragOver={(e) => handleColorDragOver(e, item)}
                                    onDragLeave={handleColorDragLeave}
                                    onDrop={(e) => handleColorDrop(e, item)}
                                    style={{
                                        cursor: isDraggingColor ? "grabbing" : "grab",
                                        border: draggedOverColor === item ? "2px dashed #007bff" : "1px solid #ddd",
                                        backgroundColor: draggedOverColor === item ? "#f8f9fa" : "white",
                                        transform: draggedColor === item ? "scale(0.95)" : "scale(1)",
                                        transition: "all 0.2s ease",
                                        position: "relative"
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        top: "-8px",
                                        left: "-8px",
                                        background: index === 0 ? "#28a745" : "#007bff",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "16px",
                                        height: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px",
                                        fontWeight: "bold"
                                    }}>
                                        {index === 0 ? "★" : index + 1}
                                    </span>
                                    {item}
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => handleRemoveColor(index)}
                                        disabled={isSubmitting}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="attribute-group">
                        <div className="attribute-input">
                            <label>Sizes</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    placeholder="Enter size (e.g., S, M, L, XL)"
                                    onKeyPress={(e) => handleKeyPress(e, handleAddSize)}
                                    disabled={isSubmitting}
                                />
                                <button type="button" onClick={handleAddSize} disabled={isSubmitting}>
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="attribute-display">
                            {productData.sizes.map((item, index) => (
                                <span key={index} className="attribute-tag">
                                    {item}
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => handleRemoveSize(index)}
                                        disabled={isSubmitting}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="image-upload-section">
                    {initialData && (
                        <div style={{
                            marginBottom: "15px",
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "8px",
                            fontSize: "14px"
                        }}>
                            <strong>📝 Edit Mode Instructions:</strong>
                            <ol style={{ margin: "10px 0 0 20px", padding: 0 }}>
                                <li>Add new colors using the color input above</li>
                                <li><strong>Drag & drop colors</strong> to reorder them (★ = default color, numbers = position)</li>
                                <li><strong>First color becomes the default</strong> - its first image will be shown to users</li>
                                <li>Upload images for colors using the image uploader below</li>
                                <li><strong>Drag & drop images</strong> within each color to reorder them</li>
                                <li>Click "Upload New Images" to save images to S3</li>
                                <li>Click "Update Product" to save all changes to database</li>
                            </ol>
                        </div>
                    )}
                    <ImageUpload productName={productData.name} colors={productData.colors} />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : (initialData ? 'Update' : 'Add') + ' Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductAddForm;