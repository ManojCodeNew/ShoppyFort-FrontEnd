import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import sendGetRequestToBackend from "@/components/Request/Get.jsx";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";
import { useNotification } from "@/components/Notify/NotificationProvider.jsx";
import { useUserContext } from "./ManageUsersContext.jsx";
import { useOrderContext } from "./ManageOrderContext.jsx";
// Create Context
const ManageReturnContext = createContext();

// Create Provider component
export function ManageReturnProvider({ children }) {
    const [returns, setReturns] = useState([]);
    const { showNotification } = useNotification();
    const { ordersData, fetchOrders } = useOrderContext();
    const { allUsers, token } = useUserContext();

    // Fetch Returns (Authenticated Request)
    const fetchReturns = useCallback(async () => {
        if (!token) return;

        try {
            let orders = ordersData;
            // Check if ordersData is empty and fetch orders if needed
            if (!orders || orders.length === 0) {
                orders = await fetchOrders();
            }


            const returnsResult = await sendGetRequestToBackend('admin/returns', token);

            if (returnsResult.success) {
                const enhancedReturns = returnsResult.returns?.map((returnItem) => {

                    // Find the corresponding order using orderid
                    const order = orders?.find(o => o._id === returnItem.orderid);

                    // Find the product details within the order's items array using productid
                    const product = order?.items?.find(p => p._id === returnItem.productid);

                    const user = allUsers?.find(u => u._id === returnItem.userid);

                    return {
                        ...returnItem,
                        orderDetails: order || {}, // Add order details
                        productDetails: product || {}, // Add product details
                        userDetails: user || {},
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
    }, [token, showNotification, fetchOrders, ordersData]);

    // Update Return Status
    const updateStatus = useCallback(
        async (id, status) => {
            try {
                const response = await sendPostRequestToBackend(`admin/returns/updateReturnStatus`, { return_id: id, status }, token);
                if (response.success) {
                    setReturns((prev) =>
                        prev.map((item) =>
                            item._id === id ? { ...item, status } : item
                        )
                    );
                    showNotification(`Status updated to ${status}`, "success");
                    return true;
                } else {
                    showNotification(response.error || "Failed to update status", "error");
                    return false;

                }
            } catch (error) {
                showNotification("Failed to update status", "error");
                console.error("Error updating status:", error);
                return false;

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
                    setReturns((prev) => prev.filter((item) => item._id !== id));
                    showNotification("Return request deleted", "success");
                    return true;
                } else if (response.error || response.msg) {
                    showNotification(response.msg || response.error, "error");
                    return false;

                }
            }
            catch (error) {
                showNotification("Failed to delete return request", "error");
                console.error("Error deleting return request:", error);
                return false;

            }
        },
        [showNotification, token]
    );

    // ✅ Send OTP Notification
    const sendReturnOtpToBackend = useCallback(async (otpData) => {
        if (!token) return null;

        try {
            const response = await sendPostRequestToBackend(
                "admin/returns/addOtp",
                otpData,
                token
            );

            if (response.success) {
                showNotification("OTP sent successfully", "success");
                return true;
            } else {
                showNotification("Failed to send OTP", "error");
                return false;

            }
        } catch (error) {
            showNotification("Error sending OTP", "error");
            return false;

        }
    }, [token, showNotification]);

    const getReturnOtpOnDb = useCallback(async (returnid) => {
        if (!token) return null;
        try {
            const response = await sendPostRequestToBackend("admin/returns/getOtp", { returnid }, token); // Send token to backend
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

    const creditMoneyToWallet = useCallback(async (returnid, amount) => {

        try {
            const response = await sendPostRequestToBackend("admin/wallet/credit", { returnid, amount }, token);

            if (response?.success || response?.alreadyWalletCredited) {
                showNotification("Wallet credited successfully" || response.error, "success");
                return true;
            } else {
                showNotification(response?.error || "Failed to credit wallet", "error");
                return false;
            }
        } catch (error) {
            showNotification("An error occurred while crediting the wallet", "error");
            console.error("Credit Wallet Error:", error);
            return false;

        }
    }, [token, showNotification]);

    useEffect(() => {
        const shouldFetch = token && allUsers.length > 0 && ordersData.length > 0;
        if (shouldFetch) {
            fetchReturns();
        }
    }, [token, allUsers, ordersData, fetchReturns]);


    const value = { returns, fetchReturns, setReturns, updateStatus, deleteReturn, sendReturnOtpToBackend, getReturnOtpOnDb, creditMoneyToWallet };

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