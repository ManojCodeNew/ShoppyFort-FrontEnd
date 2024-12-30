import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import '../../styles/components/admin/product-add-form.scss';
import { useAdminProducts } from './Context/AdminProductsContext';
const ProductAddForm = ({ onSubmit, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        originalPrice: '',
        discount: '',
        description: '',
        category: '',
        gender: 'Others',
        images: [],
        sizes: ['One Size'],
        colors: [],
        quantity:''
    });
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [previewImgs, setPreviewImgs] = useState([]);
    const { postProduct } = useAdminProducts();


    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        postProduct(formData);

    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const savingImageUrlToDB = files.map(file => file.name);
        const previewImageUrls = files.map(file => URL.createObjectURL(file));
        setFormData({ ...formData, images: [...formData.images, ...savingImageUrlToDB] });
        setPreviewImgs([...previewImgs, ...previewImageUrls])

    };

    return (
        <div className="modal-overlay">
            <div className="product-form">
                <div className="form-header">
                    <h2>{initialData ? 'Edit Product' : 'Add Product'}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Brand</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="Enter brand name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Enter price"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Original Price</label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                placeholder="Enter original price"
                            />
                        </div>

                        <div className="form-group">
                            <label>Discount (%)</label>
                            <input
                                type="number"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                placeholder="Enter discount percentage"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="t-shirts">T-Shirts</option>
                                <option value="shirts">Shirts</option>
                                <option value="jeans">Jeans</option>
                                <option value="dresses">Dresses</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                <button onClick={() => setFormData({ ...formData, colors: [...formData.colors, color] })}>Add</button>
                            </div>
                            <div className="display-colors">
                                {formData.colors.map((item, index) => (
                                    <>

                                        <p key={index}>{item}
                                            <span
                                                onClick={() => {
                                                    const updatedColors = formData.colors.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, colors: updatedColors });
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
                                <button onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, size] })}>Add</button>
                            </div>
                            <div className="display-size">
                                {formData.sizes.map((item, index) => (
                                    <>
                                        <p key={index}>{item}
                                            <span
                                                onClick={() => {
                                                    const updatedSizes = formData.sizes.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, sizes: updatedSizes });
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
                        <label >Quantity</label>
                        <input 
                        type="number" 
                        className="quantityofproduct" 
                        min="0" 
                        placeholder='Enter quantity' 
                        value={formData.quantity}
                        onChange={(e)=>setFormData({...formData,quantity:e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label>Images</label>
                        <div className="image-upload">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                id="image-upload"
                                className="hidden"
                            />
                            <label htmlFor="image-upload" className="upload-button">
                                <Upload />
                                <span>Upload Images</span>
                            </label>
                        </div>
                        <div className="image-preview">
                            {previewImgs.map((image, index) => (
                                <div key={index} className="preview-item">
                                    <img src={image} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedPreviewImgs = previewImgs.filter((_, i) => i !== index);
                                            const updatedImgs = formData.images.filter((_, i) => i !== index);
                                            setPreviewImgs(updatedPreviewImgs);
                                            setFormData({ ...formData, images: updatedImgs });
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Update' : 'Add'} Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductAddForm;