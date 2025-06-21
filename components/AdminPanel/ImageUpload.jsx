import React, { useEffect, useState, useCallback } from "react";
import "./styles/ImageUpload.css";
import { useAdminProducts } from "./Context/AdminProductsContext.jsx";
import { useNotification } from "../Notify/NotificationProvider.jsx";
import Loader from "../Load/Loader.jsx";
import { useUserContext } from "./Context/ManageUsersContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;


function ImageUpload({ productName, colors }) {
    const { setImages, initialData, removeImgOnDb, setInitialImgData } = useAdminProducts();
    const [selectedImages, setSelectedImages] = useState({});
    const { showNotification } = useNotification();
    const [hasNewImages, setHasNewImages] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useUserContext();

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOverItem, setDraggedOverItem] = useState(null);
    const [isDragging, setIsDragging] = useState(false);


    // Initialize images when colors or initialData changes
    useEffect(() => {
        if (!colors || colors.length === 0) {
            setSelectedImages({});
            setHasNewImages(false);
            return;
        }

        const initialImagesState = colors.reduce((acc, color) => {
            acc[color] = initialData?.colorImages?.[color]?.map((imageUrl, index) => ({
                id: `${color}-${index}-${Date.now()}`,
                name: imageUrl.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1] || imageUrl,
                url: imageUrl,
                file: null,
                order: index
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
            const isValidSize = file.size <= 100 * 1024 * 1024; // 5MB

            if (!isValidType) {
                showNotification(`${file.name} is not a valid image file`, "error");
                return false;
            }
            if (!isValidSize) {
                showNotification(`${file.name} is too large (max 100MB)`, "error");
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
        // Calculate total upload size
        let totalSize = 0;
        Object.values(selectedImages).forEach(colorImages => {
            colorImages.forEach(image => {
                if (image.file) {
                    totalSize += image.file.size;
                }
            });
        });

        // Check total size (e.g., 500MB total limit)
        const maxTotalSize = 500 * 1024 * 1024; // 500MB
        if (totalSize > maxTotalSize) {
            showNotification(
                `Total upload size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds limit (500MB)`,
                "error"
            );
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("productName", productName.trim());

            const newImagesMap = {};
            let fileCount = 0;

            // const updatedImagesMap = {};

            // Process images for each color
            Object.entries(selectedImages).forEach(([color, images]) => {
                const newImages = [];
                // const existingImages = [];

                images.forEach((image) => {
                    if (image.file) {
                        // New image to upload
                        formData.append("images", image.file);
                        newImages.push(image.file.name);
                        fileCount++;
                    }
                });

                if (newImages.length > 0) {
                    newImagesMap[color] = newImages;
                }
            });

            // Only proceed if there are new images to upload
            if (Object.keys(newImagesMap).length === 0) {
                showNotification("No new images to upload", "info");
                setIsLoading(false);
                return;
            }
            console.log(`Uploading ${fileCount} files, total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);

            formData.append("colorImages", JSON.stringify(newImagesMap));
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                showNotification("Upload timeout. Please try with smaller files.", "error");
            }, 600000); // 10 minutes timeout


            const response = await fetch(`${API_BASE_URL}/upload-product-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                credentials: 'include',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            console.log("Image Upload Error:", response);
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                }

                // Handle specific error codes
                if (response.status === 413) {
                    throw new Error("Files too large. Please reduce file sizes or upload fewer files at once.");
                } else if (response.status === 401) {
                    throw new Error("Authentication failed. Please login again.");
                } else if (response.status === 403) {
                    throw new Error("Access denied. Please check your permissions.");
                } else if (response.status === 404) {
                    throw new Error("Upload endpoint not found.");
                } else if (response.status >= 500) {
                    throw new Error("Server error. Please try again later.");
                }

                throw new Error(errorData.error || errorData.message || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.paths) {
                const updatedImagesMap = {};
                // Keep existing images
                Object.entries(selectedImages).forEach(([color, images]) => {
                    const existingImages = images.filter(img => !img.file);
                    if (existingImages.length > 0) {
                        updatedImagesMap[color] = existingImages;
                    }
                });
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
            if (error.name === 'AbortError') {
                showNotification("Upload timeout. Please try with smaller files or fewer images.", "error");
            } else {
                showNotification(error.message || "Failed to upload images", "error");
            }
        } finally {
            setIsLoading(false);
        }
    }, [hasNewImages, productName, selectedImages, setImages, showNotification, token]);

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
