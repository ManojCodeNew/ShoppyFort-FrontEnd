import sendPostRequestToBackend from '@/components/Request/Post';
import React, { useCallback } from 'react';
import { createContext, useContext, useState } from 'react';

// Create Context
const AdminProductsContext = createContext();

function AdminProductsProvider({ children }) {

    const [products, setProducts] = useState([]);

    const postProduct = useCallback(async (productData) => {
        try {
            const response = await sendPostRequestToBackend("admin/addProduct", productData);
            if (response.msg) {
                throw new Error(response.msg);
            }
            if (response.success) {
                console.log(response.success);
                
            }
        } catch (error) {

        }
    }, []);
    const value={
        postProduct,
        products
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
