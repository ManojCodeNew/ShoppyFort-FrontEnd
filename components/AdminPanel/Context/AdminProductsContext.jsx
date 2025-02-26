import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import React, { useCallback, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';

// Create Context
const AdminProductsContext = createContext();

function AdminProductsProvider({ children }) {

    const [products, setProducts] = useState([]);
    const [images, setImages] = useState({});
    const [initialData, setInitialData] = useState(null);
    const [initialImagData, setInitialImgData] = useState(null);

    const token = localStorage.getItem("user");

    useEffect(() => {
        if (initialData && products.length > 0) {
            // Find the product with the same _id
            const matchingProduct = products.find((product) => product._id === initialData._id);

            if (matchingProduct) {
                // Store its colorImages in initialImagData
                setInitialImgData(matchingProduct.colorImages);
            }
        }
    }, [initialData, products]);


    const postProduct = useCallback(async (productData) => {
        try {

            const finalDataToSend = {
                ...productData,
                colorImages: images,
            }
            const response = await sendPostRequestToBackend("admin/addProduct", finalDataToSend);
            if (response.msg) {
                throw new Error(response.msg);
            }
            if (response.success) {
                console.error(response.success);

            }
        } catch (error) {

        }
    }, [images]);


    const updateProduct = useCallback(async (productData) => {
        try {

            const finalUpdatedDataToSend = {
                ...productData,
                colorImages: images,
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
            console.log("Response data", data);

            if (data.success) {
                console.log("Update success:", data.success);
            }
            if (!response.ok) {
                throw new Error(data.error || "Failed to update product");
            }
        } catch (error) {
            console.error("Update failed:", error.message);
        }
    }, [images]);


    const getProducts = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend("admin/products", token);
            if (response.products) {

                // Update colorImages in each product
                const modifiedProducts = response.products.map(product => {
                    // Check if colorImages exists and is valid
                    const modifiedColorImages = product.colorImages
                        ? Object.keys(product.colorImages).reduce((acc, color) => {
                            acc[color] = product.colorImages[color].map(imagePath => {
                                // Prepend the base URL to each image path
                                return "https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/" + imagePath;
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
        initialImagData,
        updateProduct
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
