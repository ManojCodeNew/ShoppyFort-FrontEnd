import React, { useState } from 'react';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import Loader from '../Load/Loader.jsx';
import './styles/AddOffers.css';
import { useAdminOffers } from './Context/AdminOffersContext.jsx';
import { useUserContext } from './Context/ManageUsersContext.jsx';
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AddOffers = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountText, setDiscountText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [productIds, setProductIds] = useState([]);
    const [currentProductIdInput, setCurrentProductIdInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const { showNotification } = useNotification();
    const { offers, getOffers, deleteOffer, updateOffer } = useAdminOffers();
    const [uploadingImage, setUploadingImage] = useState(false);
    const { token } = useUserContext();
    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (editingOffer) {
            // Update existing offer
            const offerData = {
                title,
                description,
                discountText,
                productIds: JSON.stringify(productIds),
            };

            // If new image selected, upload it first
            if (selectedImage) {
                setUploadingImage(true);
                const formData = new FormData();
                formData.append('offerImage', selectedImage);
                formData.append('title', title);
                formData.append('description', description);
                formData.append('discountText', discountText);
                formData.append('productIds', JSON.stringify(productIds));
                formData.append('isUpdate', 'true');

                try {
                    const response = await fetch(`${API_BASE_URL}/admin/upload/offer`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });
                    const data = await response.json();
                    if (data.success) {
                        offerData.imageUrl = data.imageUrl;
                        offerData.s3Key = data.s3Key;
                    }
                } catch (error) {
                    showNotification("Failed to upload new image.", "error");
                    setIsLoading(false);
                    setUploadingImage(false);
                    return;
                }
                setUploadingImage(false);
            }

            const result = await updateOffer(editingOffer._id, offerData);
            if (result.success) {
                resetForm();
            }
        } else {
            // Create new offer
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
            formData.append('productIds', JSON.stringify(productIds));

            try {
                const response = await fetch(`${API_BASE_URL}/admin/upload/offer`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();
                setUploadingImage(false);
                if (data.success) {
                    showNotification(data.success, "success");
                    resetForm();
                    getOffers();
                } else {
                    showNotification(data.error, "error");
                }
            } catch (error) {
                console.error("Error uploading offer:", error);
                showNotification("Failed to upload offer.", "error");
            }
        }
        setIsLoading(false);
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

    const handleEditOffer = (offer) => {
        setEditingOffer(offer);
        setTitle(offer.title);
        setDescription(offer.description);
        setDiscountText(offer.discountText || '');
        setProductIds(offer.productIds || []);
        setImageUrl(offer.imageUrl);
        setSelectedImage(null);
    };

    const resetForm = () => {
        setEditingOffer(null);
        setTitle('');
        setDescription('');
        setDiscountText('');
        setSelectedImage(null);
        setImageUrl('');
        setProductIds([]);
        setCurrentProductIdInput('');
    };

    return (
        <div className="admin-offers-container">
            <div className="page-header">
                <h1 className="page-title">Offers Management</h1>
                <p className="page-subtitle">Create and manage promotional offers</p>
            </div>

            <div className="main-content">
                {/* Left Side - Create Form */}
                <div className="left-panel">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                            {editingOffer && (
                                <button type="button" onClick={resetForm} className="cancel-edit-btn">
                                    Cancel
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="offer-form">
                            <div className="form-group">
                                <label className="form-label">Offer Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter offer title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your offer"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Discount Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={discountText}
                                    onChange={(e) => setDiscountText(e.target.value)}
                                    placeholder="e.g., 50% OFF"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Offer Image</label>
                                <div className="file-upload">
                                    <input
                                        type="file"
                                        className="file-input"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        required
                                    />
                                    <div className="file-upload-text">
                                        <span>Choose Image</span>
                                    </div>
                                </div>
                                {selectedImage && (
                                    <div className="image-preview">
                                        <img
                                            src={URL.createObjectURL(selectedImage)}
                                            alt="Preview"
                                        />
                                    </div>
                                )}
                                {editingOffer && !selectedImage && imageUrl && (
                                    <div className="current-image">
                                        <label className="current-image-label">Current Image:</label>
                                        <img src={imageUrl} alt="Current" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Link Products (Optional)</label>
                                <div className="product-input">
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={currentProductIdInput}
                                        onChange={(e) => setCurrentProductIdInput(e.target.value)}
                                        placeholder="Product ID"
                                    />
                                    <button type="button" onClick={handleAddProductId} className="add-btn">
                                        Add
                                    </button>
                                </div>
                                {productIds.length > 0 && (
                                    <div className="product-tags">
                                        {productIds.map((id, index) => (
                                            <span key={index} className="product-tag">
                                                {id}
                                                <button type="button" onClick={() => handleRemoveProductId(index)}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading || uploadingImage} className="submit-btn">
                                {isLoading || uploadingImage ? (
                                    <><Loader size="small" /> {editingOffer ? 'Updating...' : 'Creating...'}</>
                                ) : (
                                    editingOffer ? 'Update Offer' : 'Create Offer'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side - Offers List */}
                <div className="right-panel">
                    <div className="offers-card">
                        <div className="offers-header">
                            <h2>Active Offers</h2>
                            <span className="offers-count">{offers?.length || 0}</span>
                        </div>
                        <div className="offers-list">
                            {offers && offers.length > 0 ? (
                                offers.map((offer) => (
                                    <div key={offer._id} className="offer-item">
                                        <div className="offer-image">
                                            <img src={offer.imageUrl} alt={offer.title} />
                                            <div className="offer-badge">{offer.discountText}</div>
                                        </div>
                                        <div className="offer-details">
                                            <h3>{offer.title}</h3>
                                            <p>{offer.description}</p>
                                            {offer.productIds && offer.productIds.length > 0 && (
                                                <div className="linked-products">
                                                    <span>Linked: {offer.productIds.length} products</span>
                                                </div>
                                            )}
                                            <div className="offer-actions">
                                                <button 
                                                    onClick={() => handleEditOffer(offer)} 
                                                    className="edit-btn"
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteOffer(offer._id)} 
                                                    className="delete-btn"
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📢</div>
                                    <h3>No offers yet</h3>
                                    <p>Create your first offer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOffers;