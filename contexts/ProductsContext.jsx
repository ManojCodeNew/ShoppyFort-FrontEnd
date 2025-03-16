import sendGetRequestToBackend from "@/components/Request/Get";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create Context
const ProductContext = createContext();

// Create the provider
export default function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    // const [defaultImage, setDefaultImage] = useState();
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await sendGetRequestToBackend('');
                console.log("Original Response:", response);

                // Update colorImages in each product
                const modifiedProducts = response.map(product => {
                    // Check if colorImages exists and is valid
                    const modifiedColorImages = product.colorImages
                        ? Object.keys(product.colorImages).reduce((acc, color) => {
                            acc[color] = product.colorImages[color].map(imagePath => {
                                // Prepend the base URL to each image path
                                return "https://shoppyfort-bucket.s3.ap-south-1.amazonaws.com/"+imagePath;
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

                console.log("Modified Products:", modifiedProducts);
                setProducts(modifiedProducts);
            } catch (error) {
                console.error("Error fetching products ", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider value={{ products, setProducts }}>
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
