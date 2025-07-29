import sendGetRequestToBackend from '@/components/Request/Get.jsx';
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import sendPostRequestToBackend from '@/components/Request/Post.jsx';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { useAuth } from './AuthContext';
// Create CartContext
const OrderDetailsContext = createContext();

// CartProvider component to provide context
export const OrderDetailsProvider = ({ children }) => {
    const [orderDetails, setOrderDetailsState] = useState(() => {
        const saved = localStorage.getItem('orderDetails');
        return saved ? JSON.parse(saved) : {
            orderid: '',
            userid: '',
            shippingaddress: '',
            items: [],
            totalprice: 0,
            CashOnDelivery: false,
        };
    });

    const [allOrder, setAllOrder] = useState([]);
    const { showNotification } = useNotification();
    const [allReturns, setAllReturns] = useState(null);
    const { token, user } = useAuth();

    const setOrderDetails = (details) => {
        setOrderDetailsState(details);
        if (details && Object.keys(details).length > 0) {
            localStorage.setItem('orderDetails', JSON.stringify(details));
        } else {
            localStorage.removeItem('orderDetails');
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await sendGetRequestToBackend("order", token);
            if (response.success) {
                setAllOrder(response.orders);
            }
        } catch (error) {
            showNotification("Error fetching orders", "error");
        }
    };

    const fetchReturns = async () => {
        try {
            const response = await sendGetRequestToBackend("order/returns", token);
            if (response.success) {
                setAllReturns(response.data);
            }
        } catch (error) {
            console.error("Error fetching returns:", error);
            showNotification("Error fetching return requests", "error");
        }
    };

    const submitReturnRequest = useCallback(async (returnData) => {
        if (!token) {
            showNotification("You must be logged in", "error");
            return false;
        }

        try {
            const body = {
                userid: user._id,
                // orderid is the _id of the order
                orderid: returnData.orderid,
                productid: returnData.productid,
                reason: returnData.reason,
                returntype: returnData.returnType,
                quantity: returnData.quantity,
                status: returnData.status
            }
            const Result = await sendPostRequestToBackend("order/Return", body, token);

            if (Result.success) {
                showNotification("Return request submitted successfully!", "success");
                // Refresh returns data after successful submission
                fetchReturns();
                return true;
            }
            if (Result.msg) {
                showNotification(Result.msg, "error");
            }
            return false;
        } catch (error) {
            showNotification(`Error submitting return: ${error.message}`, "error");
            return false;
        }
    }, [token, user]);



    const cancelOrder = useCallback(async (orderid) => {
        if (!token) {
            showNotification("You must be logged in", "error");
            return false;
        }

        try {
            const response = await sendPostRequestToBackend(
                "order/cancel",
                { orderid },
                token
            );
            if (response.success) {
                showNotification(response.message, "success");
                fetchOrders(); // Refresh the orders list
                return true;
            } else {
                showNotification(response.error || "Failed to cancel order", "error");
                return false;
            }

        } catch (error) {
            showNotification(`Error cancelling order: ${error.message}`, "error");
            return false;
        }
    }, [token, fetchOrders, showNotification]);

    const value = useMemo(() => ({
        orderDetails,
        setOrderDetails,
        submitReturnRequest,
        allOrder,
        fetchReturns,
        fetchOrders,
        user,
        allReturns,
        cancelOrder
    }), [orderDetails, allOrder, user, allReturns, token, submitReturnRequest, cancelOrder, fetchOrders])

    return (
        <OrderDetailsContext.Provider value={value}>
            {children}
        </OrderDetailsContext.Provider>
    );
};

// Custom hook to use cart context
export const useOrderDetails = () => {
    return useContext(OrderDetailsContext);
};
