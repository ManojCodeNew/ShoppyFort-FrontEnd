import React, { useState, useEffect } from 'react';
import upload from '../../assets/Images/upload.png';
import '../../styles/components/admin/product-add-form.scss';
import { useAdminProducts } from './Context/AdminProductsContext';
import sendPostRequestToBackend from '../Request/Post';
import ImageUpload from './ImageUpload';
const ProductAddForm = ({ onSubmit, onClose, initialData }) => {

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
        quantity: ''
    });
    const [color, setColor] = useState();
    const [size, setSize] = useState();
    const [previewImgs, setPreviewImgs] = useState({});
    const { postProduct } = useAdminProducts();
    const [imgFiles, setImgFiles] = useState([]);


    // useEffect(() => {
    //     if (initialData) {
    //         setFormData(initialData);
    //     }
    // }, [initialData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Product data",productData);
        postProduct(productData);
        // Create FormData of file object
        // const ImgFileData = new FormData();
        // imgFiles.forEach((file) => {
        //     ImgFileData.append('images', file);
        // });

        // // Display Img Data on console
        // for (let [key, value] of ImgFileData.entries()) {
        //     console.log(`${key}:`, value);
        // }
        // try {
        //     const response = await fetch("http://127.0.0.1:3000/admin/uploads", {
        //         method: 'POST',
        //         body: ImgFileData,
        //     });

        //     if (response.ok) {
        //         const result = await response.json();
        //         console.log('Upload successful:', result);
        //     } else {
        //         console.error('Upload failed:', await response.text());
        //     }
        //     console.log("Form data", productData);
        //     console.log("Img data", ImgFileData);


        // } catch (error) {
        //     console.error(error)
        // }

    };


    const handleImageUpload = async (e, color) => {
        const files = Array.from(e.target.files);
        const imgName = files.map(file => file.name);
        const previewImageUrls = files.map(file => URL.createObjectURL(file));
        // save image files to imgFiles state
        setImgFiles([...imgFiles, ...files]);
        console.log("previewImgs", imgName, color);


        // Add the files to the formData images array
        setProductData((prevProductData) => ({
            ...prevProductData,
            images: {
                ...prevProductData.images,
                [color]: [...(prevProductData.images[color] || []), ...imgName], // Append new images under the specific color
            },
        }));

        // Add Preview image url
        setPreviewImgs((prev) => ({
            ...prev,
            [color]: [...(prev[color] || []), ...previewImageUrls],
        }));

        // postProduct(productData);
    };


    const handleRemoveImage = (index) => {
        setProductData(
            {
                ...productData,
                images: productData.images.filter((_, i) => i !== index)
            }
        )
        setPreviewImgs((prev) => {
            return {
                ...prev,
                [color]: prev[color].filter((_, i) => i !== index), // Filter out the image at the given index
            };
        });
    }

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
                        <label >Quantity</label>
                        <input
                            type="number"
                            className="quantityofproduct"
                            min="0"
                            placeholder='Enter quantity'
                            value={productData.quantity}
                            onChange={(e) => setProductData({ ...productData, quantity: e.target.value })} />
                    </div>

                    {/* <div className="form-group">
                        <label>Images</label>
                        {productData.colors.map((color) => (


                            <div className="image-upload">
                                <h4>{color}</h4>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(e, color)}
                                    id="image-upload"
                                    className="hidden"
                                />
                                <label htmlFor="image-upload" className="upload-button">
                                    <img src={upload} alt="upload" className='upload-icon' />
                                    <span>Upload Images</span>
                                </label>
 */}

                                {/* Image preview */}
                                {/* < div className="image-preview" >
                                    {
                                        (previewImgs[color] || []).map((image, index) => (
                                            <div key={index} className="preview-item">
                                                <img src={image} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div> */}

                            {/* </div> */}
                        {/* ))} */}


                    {/* </div> */}
                    <ImageUpload productName={`${productData.name}`}/>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" >
                            {initialData ? 'Update' : 'Add'} Product
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ProductAddForm;