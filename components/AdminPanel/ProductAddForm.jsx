import React, { useState, useEffect } from 'react';
import upload from '../../assets/Images/upload.png';
import '../../styles/components/admin/product-add-form.scss';
import { useAdminProducts } from './Context/AdminProductsContext';
import sendPostRequestToBackend from '../Request/Post';
import ImageUpload from './ImageUpload';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
const ProductAddForm = ({ onSubmit, onClose }) => {

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

    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [categories, setCategories] = useState([]); // Store unique categories
    const [customCategory, setCustomCategory] = useState(""); // Custom category input
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [previewImgs, setPreviewImgs] = useState({});
    const { postProduct, initialData, updateProduct, products } = useAdminProducts();
    const [imgFiles, setImgFiles] = useState([]);
    console.log("Product=", products, initialData);

    useEffect(() => {

        if (initialData) {
            setProductData(initialData);
        }
        if (products) {
            // Extract unique categories
            const uniqueCategories = [
                ...new Set(products.map((p) => p.category)),
            ];
            setCategories(uniqueCategories);
        } else {
            showNotification("No products found", "error");
        }
    }, [initialData, products]);

    // useEffect(() => {
    //     window.location.href = "/admin/products/add";;
    // }, [products])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(productData);
        let finalCategory = productData.category === "Others" ? customCategory : productData.category;


        if (!finalCategory) {
            showNotification("Please select or enter a category.", "error");
            return;
        }

        // If it's a new category, add it to the list
        if (productData.category === "Others" && customCategory.trim() !== "") {
            setCategories((prevCategories) => [...prevCategories, customCategory]);
        }

        const updatedProductData = { ...productData, category: finalCategory };

        if (initialData) {
            await updateProduct(updatedProductData);
        } else {
            await postProduct(updatedProductData);
        }
        console.log("Product data", updatedProductData);

    };
    console.log("categories", categories);
    console.log("Initial stock value:", initialData?.stock);


    return (
        <div className="modal-overlay">
            <div className="product-form">
                <div className="form-header">
                    <h2>{initialData ? 'Edit Product' : 'Add Product'}</h2>
                </div>

                <form >
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                value={productData.name}
                                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Brand</label>
                            <input
                                type="text"
                                value={productData.brand}
                                onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                                placeholder="Enter brand name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                value={productData.price}
                                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                placeholder="Enter price"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Original Price</label>
                            <input
                                type="number"
                                value={productData.originalPrice}
                                onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                                placeholder="Enter original price"
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
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={productData.gender}
                                onChange={(e) => setProductData({ ...productData, gender: e.target.value })}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kids">Kids</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={productData.category}
                                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                required
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
                        {/* Custom Category Input (Only when "Others" is selected) */}
                        {productData.category === "Others" && (
                            <div className="form-group">
                                <label>Enter Custom Category</label>
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter new category"
                                    required
                                />
                            </div>
                        )}

                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={productData.description}
                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                            placeholder="Enter product description"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="attribute-types-container">
                        <label>Attribute Types</label>
                        <div className="attributes">
                            <div className="color-container">
                                <label className='color-title'>Color</label>
                                <input type="text" className='color-adding-input' value={color} onChange={(e) => setColor(e.target.value)} placeholder='Input a color (e.g., red, blue)' />
                                <button type='button' onClick={() => setProductData({ ...productData, colors: [...productData.colors, color] })}>Add</button>
                            </div>
                            <div className="display-colors">
                                {productData.colors.map((item, index) => (
                                    <>

                                        <p key={index}>{item}
                                            <span
                                                onClick={() => {
                                                    const updatedColors = productData.colors.filter((_, i) => i !== index);
                                                    setProductData({ ...productData, colors: updatedColors });
                                                }}
                                            >X</span>
                                        </p>
                                    </>
                                )
                                )}
                            </div>
                            <div className="size-container">

                                <label className='color-title'>Size</label>
                                <input type="text" className='size-adding-input' value={size} onChange={(e) => setSize(e.target.value)} placeholder='Enter size (e.g., X, M, XL)' />
                                <button type="button" onClick={() => setProductData({ ...productData, sizes: [...productData.sizes, size] })}>Add</button>
                            </div>
                            <div className="display-size">
                                {productData.sizes.map((item, index) => (
                                    <>
                                        <p key={index}>{item}
                                            <span
                                                onClick={() => {
                                                    const updatedSizes = productData.sizes.filter((_, i) => i !== index);
                                                    setProductData({ ...productData, sizes: updatedSizes });
                                                }}
                                            >X</span>
                                        </p>
                                    </>
                                )
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="Quantity-of-product">
                        <label >Stock</label>
                        <input
                            type="number"
                            className="quantityofproduct"
                            min="0"
                            placeholder='Enter quantity'
                            value={productData.stock !== undefined ? String(productData.stock) : ''}
                            onChange={(e) =>
                                setProductData(prevData => ({
                                    ...prevData,
                                    stock: Number(e.target.value) // Ensure it's stored as a number
                                }))
                            } />
                    </div>
                    <ImageUpload productName={`${productData.name}`} colors={productData.colors} />

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" onClick={handleSubmit} >
                            {initialData ? 'Update' : 'Add'} Product
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ProductAddForm;