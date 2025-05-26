import sendGetRequestToBackend from "@/components/Request/Get";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useAuth } from "./AuthContext.jsx";
// Create Context
const ProductContext = createContext();

// Create the provider
export default function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const { showNotification } = useNotification();
    const { user, token } = useAuth(); // Get user and token from AuthContext

    const fetchProducts = async () => {
        try {
            const response = await sendGetRequestToBackend('api/products/', token);

            // Update colorImages in each product
            const modifiedProducts = response.map(product => {
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

            setProducts(modifiedProducts);

        } catch (error) {
            showNotification("Error fetching products", "error");
        }
    };
    console.log("all peoduct data :", products);


    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider value={{ products, setProducts, fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
}
