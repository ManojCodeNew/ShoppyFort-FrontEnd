import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import sendGetRequestToBackend from "@/components/Request/Get";
// Create Context
const UserContext = createContext();

// Create Provider component
export function UserProvider({ children }) {
    const [user, setUser] = useState("MAnoj");

    // const fetchOrders = useCallback(async () => {
    //     if (!token) return;
    //     try {
    //         const response = await sendGetRequestToBackend("admin/orders", token); // Send token to backend
    //         if (response.success) {
    //             console.log(response.success);

    //             setOrdersData(response.orders);
    //         setTotalOrders(response.orders.length)

    //         } else {
    //             showNotification("Failed to fetch Users:", "error");
    //         }
    //     } catch (error) {
    //         showNotification("Error fetching Users:", "error");
    //     }
    // }, [token]);

    const value = { user }
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
