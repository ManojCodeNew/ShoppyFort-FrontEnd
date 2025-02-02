import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import React, { useCallback, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';

// Create Context
const AdminProductsContext = createContext();

function AdminProductsProvider({ children }) {

    const [products, setProducts] = useState([]);
    const [images, setImages] = useState({});


    const postProduct = useCallback(async (productData) => {
        try {

                const finalDataToSend={
                    ...productData,
                    colorImages:images,
                }
console.log("DATA",finalDataToSend);

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

    const getProducts = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend("manage");
            if (response.success) {
                setProducts(response.products);
            }

        } catch (error) {
            console.error(error);

        }
    }, []);

    const value = {
        postProduct,
        products,
        getProducts,
        setImages
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
