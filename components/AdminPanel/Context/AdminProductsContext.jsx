import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider';
import sendDeleteRequestToBackend from '@/components/Request/Delete';
import { useUserContext } from './ManageUsersContext.jsx';

const AdminProductsContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://1.app.api.shoppyfort.com/';

export function AdminProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [images, setImages] = useState({}); // { color: [{ name, url, file }] }
    const [initialData, setInitialData] = useState(null);
    const [initialImgData, setInitialImgData] = useState(null);
    const { showNotification } = useNotification();
    const { token } = useUserContext();

    // Clean up any created object URLs to avoid memory leaks
    useEffect(() => {
        // Revoke object URLs when images state changes
        return () => {
            Object.values(images).forEach(imageList => {
                imageList.forEach(img => {
                    if (img.url && img.url.startsWith("blob:")) {
                        URL.revokeObjectURL(img.url);
                    }
                });
            });
        };
    }, [images]);

    // Initialize image data when initialData or products change
    useEffect(() => {
        if (initialData && products.length > 0) {
            const matchingProduct = products.find(p => p._id === initialData._id);
            if (matchingProduct) {
                const formattedColorImages = {};
                Object.entries(matchingProduct.colorImages || {}).forEach(([color, imageUrls]) => {
                    formattedColorImages[color] = imageUrls.map(imageUrl => {
                        const S3_BASE = "https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/";
                        let imageName = imageUrl;
                        if (imageUrl.startsWith(S3_BASE)) {
                            imageName = imageUrl.substring(S3_BASE.length);
                        }
                        return {
                            name: imageName,
                            url: imageUrl,
                            file: null
                        };
                    });
                });
                setInitialImgData(formattedColorImages);
            }
        }
    }, [initialData, products]);

    const getProducts = useCallback(async () => {
        if (!token) return;
        try {
            const response = await sendGetRequestToBackend("admin/products", token);
            if (response.success) {
                const S3_BASE = "https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/";
                const modifiedProducts = response.products.map(product => {
                    const modifiedColorImages = product.colorImages
                        ? Object.fromEntries(
                            Object.entries(product.colorImages).map(([color, images]) => [
                                color,
                                images.map(imagePath => (imagePath.startsWith(S3_BASE) ? imagePath : `${S3_BASE}${imagePath}`))
                            ])
                        )
                        : {};
                    const firstColor = Object.keys(modifiedColorImages)[0];
                    const defaultImg = firstColor ? modifiedColorImages[firstColor][0] : null;
                    return {
                        ...product,
                        colorImages: modifiedColorImages,
                        defaultImg
                    };
                });
                setProducts(modifiedProducts);
            } else {
                showNotification("Failed to fetch products", "error");
            }
        } catch (error) {
            console.error("getProducts error:", error);
            showNotification("Failed to fetch products due to network error", "error");
        }
    }, [token, showNotification]);

    const postProduct = useCallback(
        async productData => {
            try {
                // Validate images
                if (!images || Object.keys(images).length === 0 || Object.values(images).every(arr => arr.length === 0)) {
                    showNotification("Please upload at least one image before posting the product.", "error");
                    return;
                }
                const finalDataToSend = {
                    ...productData,
                    colorImages: images
                };
                const response = await sendPostRequestToBackend("admin/products/addProduct", finalDataToSend, token);
                if (response.success) {
                    showNotification(response.success, "success");
                    await getProducts();
                    setImages({});
                } else {
                    showNotification(response.msg || "Failed to post product", "error");
                }
            } catch (error) {
                console.error("postProduct error:", error);
                showNotification("Something went wrong while posting the product.", "error");
            }
        },
        [images, token, showNotification, getProducts]
    );

    const updateProduct = useCallback(
        async productData => {
            try {
                // Validate images presence: either new images or existing initial images
                const noNewImages = !images || Object.keys(images).length === 0 || Object.values(images).every(arr => arr.length === 0);
                const noInitialImages = !initialImgData || Object.values(initialImgData).every(arr => arr.length === 0);

                if (noNewImages && noInitialImages) {
                    showNotification("Please upload at least one image before updating the product.", "error");
                    return;
                }

                const updatedColors = [...new Set([
                    ...(initialData?.colors || []),
                    ...(productData.colors || [])
                ])];

                const updatedImages = !noNewImages ? images : initialImgData;

                const finalUpdatedDataToSend = {
                    ...productData,
                    colors: updatedColors, // Include merged colors
                    colorImages: updatedImages
                };

                const response = await fetch(`${API_BASE_URL}/admin/products/update-product`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(finalUpdatedDataToSend)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to update product");
                }

                if (data.success) {
                    showNotification(data.success, "success");
                    await getProducts();
                    setImages({});
                }
            } catch (error) {
                console.error("updateProduct error:", error);
                showNotification("Something went wrong while updating the product.", "error");
            }
        },
        [images, initialImgData, initialData, token, showNotification, getProducts]
    );

    const removeImgOnDb = useCallback(
        async deletedImageQuery => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/products/updateImage`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(deletedImageQuery)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showNotification(result.success, "success");
                    await getProducts();
                    return result;
                } else {
                    const errorMsg = result.error || "Failed to remove image";
                    showNotification(errorMsg, "error");
                    return null;
                }
            } catch (error) {
                console.error("removeImgOnDb error:", error);
                showNotification("Something went wrong while removing the image.", "error");
                return null;
            }
        },
        [token, showNotification, getProducts]
    );

    const deleteProduct = useCallback(
        async productId => {
            if (!productId) {
                showNotification("Invalid product ID", "error");
                return;
            }
            try {
                const deleteResponse = await sendDeleteRequestToBackend("admin/products/delete-product", { productId }, token);
                if (deleteResponse.success) {
                    showNotification(deleteResponse.success, "success");
                    setProducts(prev => prev.filter(product => product._id !== productId));
                } else {
                    throw new Error(deleteResponse.error || "Failed to delete product");
                }
            } catch (error) {
                console.error("deleteProduct error:", error);
                showNotification(error.message || "Failed to delete product", "error");
            }
        },
        [token, showNotification]
    );

    // Fetch products when token changes
    useEffect(() => {
        if (token) {
            getProducts();
        }
    }, [token, getProducts]);

    const value = {
        products,
        postProduct,
        getProducts,
        setImages,
        initialData,
        setInitialData,
        updateProduct,
        removeImgOnDb,
        setInitialImgData,
        deleteProduct
    };

    return <AdminProductsContext.Provider value={value}>{children}</AdminProductsContext.Provider>;
}

export function useAdminProducts() {
    const context = useContext(AdminProductsContext);
    if (!context) throw new Error("useAdminProducts must be used within AdminProductsProvider");
    return context;
}
