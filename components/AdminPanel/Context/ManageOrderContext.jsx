import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
import sendPostRequestToBackend from "@/components/Request/Post";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useUserContext } from "./ManageUsersContext.jsx";
// Create Context
const OrderContext = createContext();

// Create Provider component
export function OrderProvider({ children }) {
    const [ordersData, setOrdersData] = useState([]);
    const { showNotification } = useNotification();
    const [totalOrders, setTotalOrders] = useState(null);
    const { allUsers,token } = useUserContext();

    // Add username to each order
    const enhanceOrdersWithUsernames = useCallback((orders, users) => {
        if (!users || !users.length) return orders;

        return orders.map(order => {
            const user = users.find(u => u._id === order.userid);

            return {
                ...order,
                userName: user ? user.fullname : 'Unknown User',
                contactDetails: user ? user.email : 'N/A'

            };
        });
    }, []);

    // Centralized error handler
    const handleError = useCallback((error, defaultMessage) => {
        console.error(error);
        showNotification(error.message || defaultMessage, "error");
    }, [showNotification]);

    const fetchOrders = useCallback(async () => {
        if (!token) return [];
        try {
            const response = await sendGetRequestToBackend("admin/orders", token); // Send token to backend
            if (response?.success) {
                const enhancedOrders = enhanceOrdersWithUsernames(response.orders, allUsers);
                setOrdersData(enhancedOrders);
                setTotalOrders(response.orders.length)

            } else {
                handleError(new Error(response?.error || "Failed to fetch orders"));
                return [];
            }
        } catch (error) {
            handleError(error, "Error fetching orders");
        }
    }, [token, allUsers, enhanceOrdersWithUsernames, handleError]);


       // ✅ Function to Update Order Status (Shipped, Delivered, etc.)
       const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        if (!token) return;
        try {
            // Create the payload object
            const payload = { 
                orderid: orderId, 
                status: newStatus 
            };
            
            // Add deliveredAt timestamp if status is "delivered"
            if (newStatus.toLowerCase() === "delivered") {
                payload.deliveredAt = new Date().toISOString();
            }
            
            // Optimistic update for UI
            setOrdersData(prevOrders =>
                prevOrders.map(order =>
                    order.orderid === orderId ? 
                    { 
                        ...order, 
                        status: newStatus,
                        // Also update deliveredAt in local state if status is delivered
                        ...(newStatus.toLowerCase() === "delivered" && { deliveredAt: payload.deliveredAt })
                    } : order
                )
            );
            
            // Send request to backend
            const response = await sendPostRequestToBackend(
                "admin/orders/updateStatus",
                payload, // Send status update with deliveredAt if applicable
                token
            );

            if (!response?.success) {
                // Revert if failed
                fetchOrders();
                throw new Error(response?.error || "Failed to update status");
            }
            
            // Show success notification
            if (newStatus.toLowerCase() === "delivered") {
                showNotification("Order marked as delivered. Return window is now active for 3 days.", "success");
            } else {
                showNotification("Status updated successfully", "success");
            }

        } catch (error) {
            handleError(error);
        }
    }, [token, showNotification, fetchOrders, handleError]);
    
    // ✅ Send OTP Notification
    const sendOtpToBackend = useCallback(async (otpData) => {
        if (!token) return null;

        try {
            const response = await sendPostRequestToBackend(
                "admin/orders/sendOtp",
                otpData,
                token
            );

            if (response.success) {
                showNotification("OTP sent successfully", "success");
            } else {
                showNotification("Failed to send OTP", "error");
            }
        } catch (error) {
            showNotification("Error sending OTP", "error");
        }
    }, [token, showNotification]);

    const getOtpOnDb = useCallback(async (orderid) => {
        if (!token) return null;
        try {
            const response = await sendPostRequestToBackend("admin/orders/otp", { orderid }, token); // Send token to backend
            if (response.success) {
                return response;
            }
            else {
                showNotification(response.error);
                return null;
            }
        } catch (error) {
            showNotification("Error retrieving OTP", "error");
            return null;
        }

    }, [token, showNotification]);

    // Initial fetch and cleanup
    useEffect(() => {
        if (token) {
            const controller = new AbortController();
            fetchOrders();
            return () => controller.abort();
        }
    }, [token, fetchOrders]);
console.log("ordersData", ordersData);

    const value = { ordersData, fetchOrders, updateOrderStatus, sendOtpToBackend, getOtpOnDb, totalOrders }
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
