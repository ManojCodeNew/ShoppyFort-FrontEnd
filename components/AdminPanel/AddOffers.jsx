import React, { useState } from 'react';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import Loader from '../Load/Loader.jsx';
import './styles/AddOffers.css';
import { useAdminOffers } from './Context/AdminOffersContext.jsx';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AddOffers = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountText, setDiscountText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [productIds, setProductIds] = useState([]);
    const [currentProductIdInput, setCurrentProductIdInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();
    const { offers, getOffers, deleteOffer } = useAdminOffers();
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!selectedImage) {
            showNotification("Please select an image for the offer.", "error");
            setIsLoading(false);
            return;
        }
        setUploadingImage(true);

        const formData = new FormData();
        formData.append('offerImage', selectedImage);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('discountText', discountText);
        formData.append('productIds', JSON.stringify(productIds)); // Send productIds as a JSON string

        try {
            const response = await fetch(`${API_BASE_URL}/admin/upload/offer`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setUploadingImage(false);
            setIsLoading(false);
            if (data.success) {
                setImageUrl(data.imageUrl);
                showNotification(data.success, "success");
                setTitle('');
                setDescription('');
                setDiscountText('');
                setSelectedImage(null);
                setImageUrl('');
                setProductIds([]); // Clear productIds array on success
                setCurrentProductIdInput('');
                getOffers();
            } else {
                showNotification(data.error, "error");
            }
        } catch (error) {
            console.error("Error uploading offer:", error);
            showNotification("Failed to upload offer.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOffer = async (offerId) => {
        if (window.confirm("Are you sure you want to delete this offer?")) {
            setIsLoading(true);
            try {
                await deleteOffer(offerId);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAddProductId = () => {
        const trimmedInput = currentProductIdInput.trim();
        if (trimmedInput && !productIds.includes(trimmedInput)) {
            setProductIds([...productIds, trimmedInput]);
            setCurrentProductIdInput('');
        } else if (productIds.includes(trimmedInput)) {
            showNotification("Product ID already added.", "warning");
        } else {
            showNotification("Please enter a Product ID.", "warning");
        }
    };

    const handleRemoveProductId = (indexToRemove) => {
        setProductIds(productIds.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="ad-offers-container">
            <h2>Create New Ad Offer</h2>
            <form onSubmit={handleSubmit} className="ad-offers-form">
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="discountText">Discount/Link to Offers :</label>
                    <input
                        type="text"
                        id="discountText"
                        value={discountText}
                        onChange={(e) => setDiscountText(e.target.value)}
                        placeholder="e.g., 50 , link-to-offers"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="offerImage">Offer Image:</label>
                    <input
                        type="file"
                        id="offerImage"
                        onChange={handleImageChange}
                        required
                    />
                    {selectedImage && (
                        <div className="image-preview">
                            <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Offer Preview"
                                style={{ maxWidth: '200px', marginTop: '10px' }}
                            />
                        </div>
                    )}
                    {imageUrl && !selectedImage && (
                        <div className="image-preview">
                            <img
                                src={imageUrl}
                                alt="Uploaded Offer Image"
                                style={{ maxWidth: '200px', marginTop: '10px' }}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group optional">
                    <label htmlFor="productId">Optional: Link to Product IDs:</label>
                    <div className="product-ids-input-group">
                        <input
                            type="text"
                            id="productId"
                            value={currentProductIdInput}
                            onChange={(e) => setCurrentProductIdInput(e.target.value)}
                            placeholder="Enter Product ID"
                        />
                        <button type="button" onClick={handleAddProductId} className="add-product-id-button secondary">
                            Add
                        </button>
                    </div>
                    {productIds.length > 0 && (
                        <div className="product-ids-list">
                            {productIds.map((id, index) => (
                                <span key={index} className="product-id-tag">
                                    {id}
                                    <button type="button" onClick={() => handleRemoveProductId(index)} className="remove-tag-button">
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <small className="text-muted form-text">
                        Enter Product IDs to link to this offer. Click 'Add' for each ID.
                    </small>
                </div>

                <button type="submit" disabled={isLoading} className="submit-button">
                    {isLoading ? <Loader size="small" /> : 'Create Offer'}
                </button>
            </form>

            <hr className="section-divider" />

            <div className="available-offers-section">
                <h2>Current Offers</h2>
                {offers && offers.length > 0 ? (
                    <ul className="offers-list">
                        {offers.map((offer) => (
                            <li key={offer._id} className="offer-card">
                                <div className="offer-image-wrapper">
                                    <img src={offer.imageUrl} alt={offer.title} className="offer-image" />
                                </div>
                                <div className="offer-details">
                                    <h3 className="offer-title">{offer.title}</h3>
                                    <p className="offer-description">{offer.description}</p>
                                    <p className="offer-discount">{offer.discountText}</p>
                                    {offer.productIds && offer.productIds.length > 0 && (
                                        <p className="offer-product-id">Product IDs: {offer.productIds.join(', ')}</p>
                                    )}
                                    <button onClick={() => handleDeleteOffer(offer._id)} className="delete-button secondary">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-offers">No attractive offers available yet. Create one!</div>
                )}
            </div>
        </div>
    );
};

export default AddOffers;