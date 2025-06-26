import React, { useEffect, useState, useCallback } from "react";
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
                id: `${color}-${index}-${Date.now()}`, // Add unique ID for drag operations
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
    }, [selectedImages]);

    const handleImageSelection = useCallback((e, colorName) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB

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

        setSelectedImages(prevImages => {
            const existingCount = selectedImages[colorName]?.length || 0;
            const newFiles = validFiles.map((file, index) => ({
                id: `${colorName}-new-${Date.now()}-${index}`,
                name: file.name,
                url: URL.createObjectURL(file),
                file,
                order: existingCount + index
            }));
            return {
                ...prevImages,
                [colorName]: [...(prevImages[colorName] || []), ...newFiles],
            }
        });

        setHasNewImages(true);
        showNotification(`${validFiles.length} image(s) selected successfully!`, "success");

        // Clear the input
        e.target.value = '';
    }, [showNotification]);

    const removeImage = useCallback(async (colorName, imageId, e) => {
        e.preventDefault();

        const colorImages = selectedImages[colorName] || [];
        const imageIndex = colorImages.findIndex(img => img.id === imageId);

        if (imageIndex === -1) {
            showNotification("Image not found!", "error");
            return;
        }

        const imageToRemove = colorImages[imageIndex];
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
                    position: imageIndex
                });

                if (!dbResponse?.success) {
                    throw new Error(dbResponse?.error || "Failed to update database");
                }

                showNotification("Image deleted successfully!", "success");
            } else {
                // New image - just remove from local state
                URL.revokeObjectURL(url);
                showNotification("Image removed successfully!", "success");
            }

            // Update local state - remove image and reorder remaining images
            const updatedImages = colorImages
                .filter(img => img.id !== imageId)
                .map((img, index) => ({ ...img, order: index }));

            setSelectedImages(prevImages => ({
                ...prevImages,
                [colorName]: updatedImages
            }));

            // Update context states
            setImages(prevImages => {
                const updatedState = { ...prevImages };
                if (updatedState[colorName]) {
                    updatedState[colorName] = updatedState[colorName].filter(
                        img => img.id !== imageId
                    );
                    if (updatedState[colorName].length === 0) {
                        delete updatedState[colorName];
                    }
                }
                return updatedState;
            });

        } catch (error) {
            console.error("Error removing image:", error);
            showNotification(error.message || "Failed to remove image", "error");
        } finally {
            setIsLoading(false);
        }
    }, [selectedImages, initialData, removeImgOnDb, setImages, showNotification]);

    // Drag and Drop handlers
    const handleDragStart = useCallback((e, colorName, imageId) => {
        setDraggedItem({ colorName, imageId });
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.target.style.opacity = '0.5';
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDraggedOverItem(null);
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e, colorName, imageId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverItem({ colorName, imageId });
    }, []);

    const handleDragLeave = useCallback((e) => {
        // Only clear if we're actually leaving the draggable area
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggedOverItem(null);
        }
    }, []);

    const handleDrop = useCallback((e, targetColorName, targetImageId) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.imageId === targetImageId) {
            return;
        }

        const { colorName: sourceColorName, imageId: sourceImageId } = draggedItem;

        // Only allow reordering within the same color
        if (sourceColorName !== targetColorName) {
            showNotification("Images can only be reordered within the same color", "warning");
            return;
        }

        const colorImages = [...(selectedImages[sourceColorName] || [])];
        const sourceIndex = colorImages.findIndex(img => img.id === sourceImageId);
        const targetIndex = colorImages.findIndex(img => img.id === targetImageId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        // Reorder the images
        const [movedImage] = colorImages.splice(sourceIndex, 1);
        colorImages.splice(targetIndex, 0, movedImage);

        // Update order property
        const reorderedImages = colorImages.map((img, index) => ({
            ...img,
            order: index
        }));

        setSelectedImages(prevImages => ({
            ...prevImages,
            [sourceColorName]: reorderedImages
        }));

        // Update context state as well
        setImages(prevImages => ({
            ...prevImages,
            [sourceColorName]: reorderedImages
        }));

        setHasNewImages(true);
        showNotification("Images reordered successfully!", "success");
    }, [draggedItem, selectedImages, setImages, showNotification]);

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

            // Process images for each color in the correct order
            Object.entries(selectedImages).forEach(([color, images]) => {
                // Sort images by their order property
                const sortedImages = images.sort((a, b) => a.order - b.order);
                const newImages = [];

                sortedImages.forEach((image) => {
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


            formData.append("colorImages", JSON.stringify(newImagesMap));

            // Include image order information
            const imageOrderMap = {};
            Object.entries(selectedImages).forEach(([color, images]) => {
                imageOrderMap[color] = images
                    .sort((a, b) => a.order - b.order)
                    .map(img => ({
                        name: img.name,
                        order: img.order,
                        isNew: !!img.file
                    }));
            });
            formData.append("imageOrder", JSON.stringify(imageOrderMap));

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

                // Keep existing images in their current order
                Object.entries(selectedImages).forEach(([color, images]) => {
                    const sortedImages = images.sort((a, b) => a.order - b.order);
                    const existingImages = sortedImages.filter(img => !img.file);
                    if (existingImages.length > 0) {
                        updatedImagesMap[color] = existingImages;
                    }
                });

                // Process uploaded images and insert them in the correct positions
                data.paths.forEach(({ color, keys }) => {
                    if (!updatedImagesMap[color]) {
                        updatedImagesMap[color] = [];
                    }

                    const newImages = keys.map((key, index) => ({
                        id: `${color}-${Date.now()}-${index}`,
                        name: key,
                        url: `https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/${key}`,
                        file: null,
                        order: updatedImagesMap[color].length + index
                    }));

                    updatedImagesMap[color] = [
                        ...updatedImagesMap[color],
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
            <div style={{
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f0f8ff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px"
            }}>
                <strong>💡 Tip:</strong> Drag and drop images to reorder them within each color. The first image will be used as the default display image.
            </div>

            {colors.map(color => (
                <div key={color} className="img-selection-block" style={{ marginBottom: "30px" }}>
                    <h3 style={{
                        color: "#333",
                        borderBottom: "2px solid #eee",
                        paddingBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        {color}
                        <span style={{
                            fontSize: "12px",
                            color: "#666",
                            backgroundColor: "#f5f5f5",
                            padding: "2px 8px",
                            borderRadius: "12px"
                        }}>
                            {(selectedImages[color] || []).length} images
                        </span>
                    </h3>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageSelection(e, color)}
                        disabled={isLoading}
                        style={{ marginBottom: "15px" }}
                    />

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: "10px",
                        marginTop: "10px"
                    }}>
                        {(selectedImages[color] || [])
                            .sort((a, b) => a.order - b.order)
                            .map((image, index) => (
                                <div
                                    key={image.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, color, image.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, color, image.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, color, image.id)}
                                    style={{
                                        position: "relative",
                                        cursor: isDragging ? "grabbing" : "grab",
                                        border: draggedOverItem?.imageId === image.id ? "2px dashed #007bff" : "1px solid #ddd",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        backgroundColor: draggedOverItem?.imageId === image.id ? "#f8f9fa" : "white",
                                        transform: draggedItem?.imageId === image.id ? "scale(0.95)" : "scale(1)",
                                        transition: "all 0.2s ease",
                                        boxShadow: draggedOverItem?.imageId === image.id ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {/* Order indicator */}
                                    <div style={{
                                        position: "absolute",
                                        top: "5px",
                                        left: "5px",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "20px",
                                        height: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        zIndex: 2
                                    }}>
                                        {index + 1}
                                    </div>

                                    <img
                                        src={image.url}
                                        alt={`${color} Image ${index + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "120px",
                                            objectFit: "cover",
                                            display: "block"
                                        }}
                                        draggable={false} // Prevent image drag
                                    />

                                    <button
                                        onClick={(e) => removeImage(color, image.id, e)}
                                        disabled={isLoading}
                                        style={{
                                            position: "absolute",
                                            top: "5px",
                                            right: "5px",
                                            background: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            fontWeight: "bold",
                                            zIndex: 2,
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                        }}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>

                                    {image.file && (
                                        <div style={{
                                            position: "absolute",
                                            bottom: "0",
                                            left: "0",
                                            right: "0",
                                            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                            color: "white",
                                            fontSize: "10px",
                                            padding: "8px 4px 4px",
                                            textAlign: "center",
                                            fontWeight: "bold"
                                        }}>
                                            NEW
                                        </div>
                                    )}

                                    {index === 0 && (
                                        <div style={{
                                            position: "absolute",
                                            top: "30px",
                                            left: "5px",
                                            background: "#28a745",
                                            color: "white",
                                            fontSize: "8px",
                                            padding: "2px 6px",
                                            borderRadius: "10px",
                                            fontWeight: "bold"
                                        }}>
                                            DEFAULT
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
                        padding: "12px 24px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transition: "background-color 0.2s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
                >
                    Upload New Images
                </button>
            )}
        </div>
    );
}

export default ImageUpload;