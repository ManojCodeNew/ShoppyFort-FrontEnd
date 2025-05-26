import React, { useEffect, useState, useCallback } from "react";
import "./styles/ImageUpload.css";
import { useAdminProducts } from "./Context/AdminProductsContext.jsx";
import { useNotification } from "../Notify/NotificationProvider.jsx";
import Loader from "../Load/Loader.jsx";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ImageUpload({ productName, colors }) {
    const { setImages, initialData, removeImgOnDb, setInitialImgData } = useAdminProducts();
    const [selectedImages, setSelectedImages] = useState({});
    const { showNotification } = useNotification();
    const [hasNewImages, setHasNewImages] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize images when colors or initialData changes
    useEffect(() => {
        if (!colors || colors.length === 0) {
            setSelectedImages({});
            setHasNewImages(false);
            return;
        }

        const initialImagesState = colors.reduce((acc, color) => {
            acc[color] = initialData?.colorImages?.[color]?.map(imageUrl => ({
                name: imageUrl.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1] || imageUrl,
                url: imageUrl,
                file: null
            })) || [];
            return acc;
        }, {});

        setSelectedImages(initialImagesState);
        setHasNewImages(false);
    }, [colors, initialData]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(selectedImages).forEach(colorImages => {
                colorImages.forEach(image => {
                    if (image.file && image.url) {
                        URL.revokeObjectURL(image.url);
                    }
                });
            });
        };
    }, []);

    const handleImageSelection = useCallback((e, colorName) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            
            if (!isValidType) {
                showNotification(`${file.name} is not a valid image file`, "error");
                return false;
            }
            if (!isValidSize) {
                showNotification(`${file.name} is too large (max 5MB)`, "error");
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newFiles = validFiles.map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file
        }));

        setSelectedImages(prevImages => ({
            ...prevImages,
            [colorName]: [...(prevImages[colorName] || []), ...newFiles],
        }));
        
        setHasNewImages(true);
        showNotification(`${validFiles.length} image(s) selected successfully!`, "success");
        
        // Clear the input
        e.target.value = '';
    }, [showNotification]);

    const removeImage = useCallback(async (colorName, index, e) => {
        e.preventDefault();
        
        if (!selectedImages[colorName] || !selectedImages[colorName][index]) {
            showNotification("Image not found!", "error");
            return;
        }

        const updatedImages = [...selectedImages[colorName]];
        const imageToRemove = updatedImages[index];
        const { url, file } = imageToRemove;

        try {
            if (!file) {
                // Existing image from S3 - need to delete from S3 and DB
                const imagePath = decodeURIComponent(
                    url.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1] || url
                );

                if (!imagePath) {
                    showNotification("Invalid image path!", "error");
                    return;
                }

                setIsLoading(true);

                // Delete from S3
                const s3Response = await fetch(`${API_BASE_URL}/delete-image`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imagePath }),
                });

                const s3Result = await s3Response.json();

                if (!s3Result.success) {
                    throw new Error(s3Result.message || "Failed to delete from S3");
                }

                // Delete from database
                const dbResponse = await removeImgOnDb({ 
                    id: initialData._id, 
                    colorname: colorName, 
                    position: index 
                });

                if (!dbResponse?.success) {
                    throw new Error(dbResponse?.error || "Failed to update database");
                }

                showNotification("Image deleted successfully!", "success");
                
                // Update local state
                updatedImages.splice(index, 1);
                setSelectedImages(prevImages => ({ 
                    ...prevImages, 
                    [colorName]: updatedImages 
                }));

                // Update context states
                setImages(prevImages => {
                    const updatedState = { ...prevImages };
                    if (updatedState[colorName]) {
                        updatedState[colorName] = updatedState[colorName].filter(
                            img => img.name !== imagePath
                        );
                        if (updatedState[colorName].length === 0) {
                            delete updatedState[colorName];
                        }
                    }
                    return updatedState;
                });

                setInitialImgData(prevImages => {
                    const updatedState = { ...prevImages };
                    if (updatedState[colorName]) {
                        updatedState[colorName] = updatedState[colorName].filter(
                            img => img.name !== imagePath
                        );
                        if (updatedState[colorName].length === 0) {
                            delete updatedState[colorName];
                        }
                    }
                    return updatedState;
                });

            } else {
                // New image - just remove from local state
                URL.revokeObjectURL(url);
                updatedImages.splice(index, 1);
                setSelectedImages(prevImages => ({ 
                    ...prevImages, 
                    [colorName]: updatedImages 
                }));
                showNotification("Image removed successfully!", "success");
            }

        } catch (error) {
            console.error("Error removing image:", error);
            showNotification(error.message || "Failed to remove image", "error");
        } finally {
            setIsLoading(false);
        }
    }, [selectedImages, initialData, removeImgOnDb, setImages, setInitialImgData, showNotification]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!hasNewImages) {
            showNotification("No new images to upload", "info");
            return;
        }

        if (!productName?.trim()) {
            showNotification("Product name is required", "error");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("productName", productName.trim());

            const newImagesMap = {};
            const updatedImagesMap = {};

            // Process images for each color
            Object.entries(selectedImages).forEach(([color, images]) => {
                const newImages = [];
                const existingImages = [];

                images.forEach((image) => {
                    if (image.file) {
                        // New image to upload
                        formData.append("images", image.file);
                        newImages.push(image.file.name);
                    } else {
                        // Existing image from S3
                        existingImages.push(image);
                    }
                });

                if (newImages.length > 0) {
                    newImagesMap[color] = newImages;
                }

                if (existingImages.length > 0) {
                    updatedImagesMap[color] = existingImages;
                }
            });

            // Only proceed if there are new images to upload
            if (Object.keys(newImagesMap).length === 0) {
                showNotification("No new images to upload", "info");
                setIsLoading(false);
                return;
            }

            formData.append("colorImages", JSON.stringify(newImagesMap));

            const response = await fetch("http://localhost:3000/upload-product-images", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            if (data.success && data.paths) {
                // Process uploaded images
                data.paths.forEach(({ color, keys }) => {
                    if (!updatedImagesMap[color]) {
                        updatedImagesMap[color] = [];
                    }

                    const newImages = keys.map(key => ({
                        name: key,
                        url: `https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/${key}`,
                        file: null,
                    }));

                    updatedImagesMap[color] = [
                        ...(updatedImagesMap[color] || []),
                        ...newImages,
                    ];
                });

                // Clean up object URLs for uploaded files
                Object.values(selectedImages).forEach(colorImages => {
                    colorImages.forEach(image => {
                        if (image.file && image.url) {
                            URL.revokeObjectURL(image.url);
                        }
                    });
                });

                // Update states
                setSelectedImages(updatedImagesMap);
                setImages(updatedImagesMap);
                setHasNewImages(false);

                showNotification("Images uploaded successfully!", "success");
            } else {
                throw new Error(data.error || "Upload failed");
            }

        } catch (error) {
            console.error("Upload failed:", error);
            showNotification(error.message || "Failed to upload images", "error");
        } finally {
            setIsLoading(false);
        }
    }, [hasNewImages, productName, selectedImages, setImages, showNotification]);

    if (!colors || colors.length === 0) {
        return (
            <div style={{ padding: "20px" }}>
                <h2>Product Image Uploader</h2>
                <p>You haven't selected any colors yet.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Product Image Uploader</h2>
            
            {colors.map(color => (
                <div key={color} className="img-selection-block">
                    <h3>{color}</h3>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => handleImageSelection(e, color)}
                        disabled={isLoading}
                    />
                    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
                        {(selectedImages[color] || []).map((image, index) => (
                            <div key={`${color}-${index}`} style={{ position: "relative", margin: "5px" }}>
                                <img 
                                    src={image.url} 
                                    alt={`${color} Image ${index + 1}`} 
                                    style={{ 
                                        width: "100px", 
                                        height: "100px",
                                        objectFit: "cover",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px"
                                    }} 
                                />
                                <button 
                                    onClick={(e) => removeImage(color, index, e)} 
                                    disabled={isLoading}
                                    style={{ 
                                        position: "absolute", 
                                        top: "-8px", 
                                        right: "-8px", 
                                        background: "red", 
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    ×
                                </button>
                                {image.file && (
                                    <div style={{
                                        position: "absolute",
                                        bottom: "0",
                                        left: "0",
                                        right: "0",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        fontSize: "10px",
                                        padding: "2px",
                                        textAlign: "center"
                                    }}>
                                        New
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            {isLoading && <Loader />}
            
            {hasNewImages && !isLoading && (
                <button 
                    onClick={handleSubmit} 
                    style={{ 
                        marginTop: "20px", 
                        padding: "10px 20px", 
                        backgroundColor: "green", 
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Upload New Images
                </button>
            )}
        </div>
    );
}

export default ImageUpload;