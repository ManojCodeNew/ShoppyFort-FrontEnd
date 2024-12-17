import sendGetRequestToBackend from "@/components/Request/Get";
import React, { Children, createContext, useContext, useEffect, useState } from "react";

// Create Context
const ProductContext = createContext();

// Create the provider
export default function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    // const [categories, setCategories] = useState({});

    // // Dynamically generate categories
    // useEffect(() => {
    //     const groupedCategories = products.reduce((acc, product) => {
    //         if (!acc[product.category]) {
    //             acc[product.category] = {
    //                 name: product.category,
    //                 subcategories: []
    //             };
    //         }
    //         if (!acc[product.category].subcategories.some(sub => sub.name === product.subcategory)) {
    //             acc[product.category].subcategories.push({
    //                 id: product.id,
    //                 name: product.subcategory,
    //                 path: `/products/${product.category}/${product.subcategory}`
    //             });
    //         }
    //         return acc;
    //     }, {});

    //     setCategories(groupedCategories);
    // }, [products]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await sendGetRequestToBackend('');
                setProducts(response);
            } catch (error) {
                console.error("Error fetching products", error);

            }
        };
        fetchProducts();
    }, []);
    return (
        <ProductContext.Provider value={{ products, setProducts }}>
            {children}
        </ProductContext.Provider>
    )
}
export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
}
