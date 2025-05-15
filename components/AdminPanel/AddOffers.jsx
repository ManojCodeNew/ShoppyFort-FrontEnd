import React, { useState } from 'react';
import { useNotification } from '../Notify/NotificationProvider.jsx';
import Loader from '../Load/Loader.jsx';
import './styles/AddOffers.css';

const AddOffers = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountText, setDiscountText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [productId, setProductId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

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

        const formData = new FormData();
        formData.append('offerImage', selectedImage);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('discountText', discountText);
        formData.append('productId', productId); // Include productId

        // To see individual values:
        console.log("Title:", formData.get('title'));
        console.log("Description:", formData.get('description'));
        console.log("Discount Text:", formData.get('discountText'));
        console.log("Product ID:", formData.get('productId'));
        console.log("Offer Image:", formData.get('offerImage')); // Will show [object File]


        try {
            const response = await fetch('http://localhost:3000/admin/upload/offer', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setImageUrl(data.imageUrl);
                showNotification(data.success, "success");
                // Optionally, you can clear the form here after successful upload
                setTitle('');
                setDescription('');
                setDiscountText('');
                setSelectedImage(null);
                setImageUrl('');
                setProductId('');
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
                        placeholder="e.g., 50 ,20"
                        required
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
                    <label htmlFor="productId">Optional: Link to Product ID:</label>
                    <input
                        type="text"
                        id="productId"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        placeholder="Enter Product ID to link"
                    />
                    <small className="text-muted form-text">
                        If you enter a Product ID, the "Shop Now" button will link to that product.
                    </small>
                </div>

                <button type="submit" disabled={isLoading} className="submit-button">
                    {isLoading ? <Loader size="small" /> : 'Create Offer'}
                </button>
            </form>
        </div>
    );
};

export default AddOffers;