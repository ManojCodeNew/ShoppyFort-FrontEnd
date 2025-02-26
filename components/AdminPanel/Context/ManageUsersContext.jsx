import React from "react";
import { createContext, useContext,useState,useEffect,useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
// Create Context
const UserContext = createContext();

// Create Provider component
export function UserProvider({ children }) {
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
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

// create custom hook
export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
}
