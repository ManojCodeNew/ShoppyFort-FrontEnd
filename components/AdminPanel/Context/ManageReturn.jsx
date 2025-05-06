import React, { createContext, useContext, useState, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get.jsx";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";
import { useNotification } from "@/components/Notify/NotificationProvider.jsx";
import { useOrderContext } from "./ManageOrderContext.jsx";
import { useUserContext } from "./ManageUsersContext.jsx";
// Create Context
const ManageReturnContext = createContext();

// Create Provider component
export function ManageReturnProvider({ children }) {
    const [returns, setReturns] = useState([]);
    const { showNotification } = useNotification();
    const { ordersData, fetchOrders } = useOrderContext();
    const { allUsers,token } = useUserContext();

    // Fetch Returns (Authenticated Request)
    const fetchReturns = useCallback(async () => {
        if (!token) return;

        try {
            // Check if ordersData is empty and fetch orders if needed
            if (!ordersData || ordersData.length === 0) {
                console.log("Fetching orders data...");
                
                await fetchOrders(); // Fetch orders from ManageOrderContext
            }
            const returnsResult = await sendGetRequestToBackend('admin/returns', token);
            console.log("returnsResult :", returnsResult);

            if (returnsResult.success) {
                const enhancedReturns = returnsResult.returns.map((returnItem) => {
                    // Find the corresponding order using orderid
                    const order = ordersData.find(o => o._id === returnItem.orderid);

                    // Find the product details within the order's items array using productid
                    const product = order?.items?.find(p => p._id === returnItem.productid);

                    // Find the user details using userid
                    // const user = allUsers.find(u => u._id === returnItem.userid);

                    return {
                        ...returnItem,
                        orderDetails: order || {}, // Add order details
                        productDetails: product || {}, // Add product details
                        // userDetails: user || {}, // Add user details
                    };
                });

                setReturns(enhancedReturns);
            }
            else if (returnsResult.error || returnsResult.msg) {
                showNotification(returnsResult.msg || returnsResult.error, "error");
            }
        } catch (error) {
            showNotification("Failed to fetch returns", "error");
            console.error("Error fetching returns:", error);
        }
    }, [token, showNotification]);
    console.log("returns :", returns);

    // Update Return Status
    const updateStatus = useCallback(
        async (id, status) => {
            try {
                const response = await sendPostRequestToBackend(`admin/returns/updateReturnStatus`, { return_id: id, status }, token);
                if (response.success) {
                    setReturns((prev) =>
                        prev.map((item) =>
                            item.id === id ? { ...item, status } : item
                        )
                    );
                    showNotification(`Status updated to ${status}`, "success");
                } else {
                    showNotification(response.error || "Failed to update status", "error");
                }
            } catch (error) {
                showNotification("Failed to update status", "error");
                console.error("Error updating status:", error);
            }
        },
        [showNotification]
    );

    // Delete Return Request
    const deleteReturn = useCallback(
        async (id) => {
            try {
                const response = await sendPostRequestToBackend(`admin/returns/deleteReturn`, { return_id: id }, token);
                if (response.success) {
                    setReturns((prev) => prev.filter((item) => item.id !== id));
                    showNotification("Return request deleted", "success");
                } else if (response.error || response.msg) {
                    showNotification(response.msg || response.error, "error");
                }
            }
            catch (error) {
                showNotification("Failed to delete return request", "error");
                console.error("Error deleting return request:", error);
            }
        },
        [showNotification]
    );

    const value = { returns, fetchReturns, setReturns, updateStatus, deleteReturn };

    return (
        <ManageReturnContext.Provider value={value}>
            {children}
        </ManageReturnContext.Provider>
    );
}

// Create custom hook
export function useManageReturnContext() {
    const context = useContext(ManageReturnContext);
    if (!context) {
        throw new Error("useManageReturnContext must be used within a ManageReturnProvider");
    }
    return context;
}