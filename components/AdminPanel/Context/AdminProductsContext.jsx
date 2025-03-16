import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import React, { useCallback, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider';
import sendDeleteRequestToBackend from '@/components/Request/Delete';
// Create Context
const AdminProductsContext = createContext();

function AdminProductsProvider({ children }) {

    const [products, setProducts] = useState([]);
    const [images, setImages] = useState({});
    const [initialData, setInitialData] = useState(null);
    const [initialImagData, setInitialImgData] = useState(null);
    const { showNotification } = useNotification();
    const token = localStorage.getItem("user");

    useEffect(() => {
        if (initialData && products.length > 0) {
            console.log("SECOND in UseEffect ", products);

            // Find the product with the same _id
            const matchingProduct = products.find((product) => product._id === initialData._id);
            if (matchingProduct) {
                const formattedColorImages = {};
                Object.entries(matchingProduct.colorImages || {}).forEach(([color, images]) => {
                    formattedColorImages[color] = images.map(imageName => ({
                        name: imageName.split("https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/")[1],
                        url: imageName,
                        file: null
                    }));
                });
                console.log("formatted Imag DATA:", formattedColorImages);


                setInitialImgData(formattedColorImages);
            }
            console.log("formatted Product:", products);
        }
    }, [initialData, products]);
    console.log("THIRD in admin context main", initialImagData);



    const postProduct = useCallback(async (productData) => {
        try {
            if (Object.keys(images).length === 0) {
                showNotification("Please upload at least one image before posting the product.", "error");
                return;
            }

            const finalDataToSend = {
                ...productData,
                colorImages: images,
            }
            const response = await sendPostRequestToBackend("admin/addProduct", finalDataToSend);
            if (response.msg) {
                showNotification(response.msg,"error");
            }
            if (response.success) {
                showNotification(response.success,"success");
                window.location.reload();
            }
        } catch (error) {

        }
    }, [images]);


    const updateProduct = useCallback(async (productData) => {
        try {
            console.log("FOURTH in UpdateProducts", initialImagData);
            console.log("Images 2", images, initialImagData);

            if (Object.keys(images).length === 0 && (!initialImagData || Object.values(initialImagData).every(arr => arr.length === 0))) {
                showNotification("Please upload at least one image before posting the product.", "error");
                return;
            }

            // Check if the images object has any keys
            const updatedImages = Object.keys(images).length > 0 ? images : initialImagData;

            const finalUpdatedDataToSend = {
                ...productData,
                colorImages: updatedImages,
            }
            console.log("finalUpdatedDataToSend", finalUpdatedDataToSend);


            const response = await fetch(`http://127.0.0.1:3000/admin/update-product`, {
                method: "PUT", // or "PATCH" if updating only specific fields
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalUpdatedDataToSend),
            });
            const data = await response.json();
            // console.log("Response data", data);

            if (data.success) {
                showNotification(data.success, "success");
                window.location.reload();
            }
            if (!response.ok) {
                throw new Error(data.error || "Failed to update product");
            }
        } catch (error) {
            console.error("Update failed:", error.message);
        }
    }, [images, initialImagData]);

    const removeImgOnDb = useCallback(async (deletedImageQuery) => {
        try {
            console.log("Image Query", deletedImageQuery);
            let UpdateImageInDB = await fetch("http://localhost:3000/admin/updateImage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deletedImageQuery),
            });
            let result = await UpdateImageInDB.json();
            // console.log("removeImgDB",result);

            if (result.success) {
                showNotification(`${result.success}`, "success");
                return result;
            } else {
                showNotification(`${result.error}`, "error");
                return result;

            }

        } catch (error) {
            console.error("Update failed:", error.message);
        }
    }, []);


    const getProducts = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend("admin/products", token);
            if (response.products) {
                console.log("FIRST in getProducts() ", response.products);

                // Update colorImages in each product
                const modifiedProducts = response.products.map(product => {
                    // Check if colorImages exists and is valid
                    const modifiedColorImages = product.colorImages
                        ? Object.keys(product.colorImages).reduce((acc, color) => {
                            acc[color] = product.colorImages[color].map(imagePath => {
                                return `https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/${imagePath}`;
                            });
                            return acc;
                        }, {})
                        : {};
                    // Get the first color and its first image
                    const firstColor = Object.keys(modifiedColorImages)[0]; // First color key
                    const defaultImg = firstColor ? modifiedColorImages[firstColor][0] : null; // First image of the first color


                    return {
                        ...product,
                        colorImages: modifiedColorImages,
                        defaultImg: defaultImg
                    };
                });

                setProducts(modifiedProducts.reverse());

            }


        } catch (error) {
            console.error(error);

        }
    }, []);

    const deleteProduct = useCallback(async (productId) => {
        try {
            if (!productId) {
                showNotification("Invalid product ID", "error");
                return;
            }

            const deleteResponse = await sendDeleteRequestToBackend("admin/delete-product", {productId} , token);

            if (deleteResponse.success) {
                showNotification(deleteResponse.success, "success");

                // Update the products list after deletion
                setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
            } else {
                throw new Error(deleteResponse.error || "Failed to delete product");
            }
        } catch (error) {
            console.error("Delete failed:", error.message);
            showNotification(error.message, "error");
        }
    }, []);


    useEffect(() => {
        getProducts();
    }, [getProducts]);


    const value = {
        postProduct,
        products,
        getProducts,
        setImages,
        initialData,
        setInitialData,
        updateProduct,
        removeImgOnDb,
        setInitialImgData,
        deleteProduct
    }

    return (
        <AdminProductsContext.Provider value={value}>
            {children}
        </AdminProductsContext.Provider>
    )
}

export default AdminProductsProvider;

export function useAdminProducts() {
    const context = useContext(AdminProductsContext);
    if (!context) {
        throw new Error("useProducts must be used within a AdminProductsProvider");
    }
    return context;
}
