import React from "react";
import { createContext, useContext,useState,useEffect,useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
// Create Context
const OrderContext = createContext();

// Create Provider component
export function OrderProvider({ children }) {
    const [ordersData, setOrdersData] = useState([]);
    const token = localStorage.getItem("user"); // Get JWT Token

    // Fetch Orders (Authenticated Request)
    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        try {
            const response = await sendGetRequestToBackend("admin/orders", token); // Send token to backend
            if (response.success) {
                setOrdersData(response.success);
            } else {
                console.error("Failed to fetch orders:", response);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }, [token]);
const value={ordersData}
    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    )
}

// create custom hook
export function useOrderContext() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrderContext must be used within a OrderProvider");
    }
    return context;
}
