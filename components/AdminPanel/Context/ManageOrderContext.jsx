import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
import sendPostRequestToBackend from "@/components/Request/Post";
import { useNotification } from "@/components/Notify/NotificationProvider";
// Create Context
const OrderContext = createContext();

// Create Provider component
export function OrderProvider({ children }) {
    const [ordersData, setOrdersData] = useState([]);
    const token = localStorage.getItem("user"); // Get JWT Token
    const { showNotification } = useNotification();

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
                console.log(response.success);

                setOrdersData(response.success);
            } else {
                showNotification("Failed to fetch orders:", "error");
            }
        } catch (error) {
            showNotification("Error fetching orders:", "error");
        }
    }, [token]);

    // ✅ Function to Update Order Status (Shipped, Delivered, etc.)
    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        if (!token) return;
        try {
            const response = await sendPostRequestToBackend(
                "admin/orders/updateStatus",
                { orderid: orderId, status: newStatus }, // Send status update
                token
            );

            if (response.success) {
                showNotification("Success to update status:", "success");
                setOrdersData(prevOrders =>
                    prevOrders.map(order =>
                        order.orderid === orderId ? { ...order, status: newStatus } : order
                    )
                );
            } else {
                showNotification("Failed to update status:", "error");
            }
        } catch (error) {
            showNotification("Error updating order status:", "error");
        }
    }, [token]);

    // ✅ Send OTP Notification
    const sendOtpToBackend = useCallback(async (otpData) => {
        if (!token) return;

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
    }, [token]);
    const getOtpOnDb = useCallback(async (orderid) => {
        const response = await sendPostRequestToBackend("admin/orders/otp", { orderid }, token); // Send token to backend
        if (response.success) {
            return response;
        }
        else {
            showNotification(response.error);
            return null;
        }
    }, [token])

    const value = { ordersData, updateOrderStatus, sendOtpToBackend, getOtpOnDb }
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
