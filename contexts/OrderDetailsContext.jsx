
import sendGetRequestToBackend from '@/components/Request/Get';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import sendPostRequestToBackend from '@/components/Request/Post';
import { useNotification } from '@/components/Notify/NotificationProvider';
// Create CartContext
const OrderDetailsContext = createContext();

// CartProvider component to provide context
export const OrderDetailsProvider = ({ children }) => {
    const [orderDetails, setOrderDetails] = useState({
        orderid: '',
        userid: '',
        shippingaddress: '',
        items: [],
        totalprice: 0,
        CashOnDelivery: false,
    })
    const [allOrder, setAllOrder] = useState([]);
    const { showNotification } = useNotification();
    const token = localStorage.getItem('user');
    const user = token ? jwtDecode(token) : null;

    const fetchOrders = async () => {
        const response = await sendGetRequestToBackend("order", token);
        if (response.success) {
            setAllOrder(response.orders);
        }
    };

    const submitReturnRequest = useCallback(async (returnData) => {
        try {
            const body = {
                userid: user.id,
                orderid: returnData.orderId,
                reason: returnData.reason,
                status: returnData.status
            }
            const Result = await sendPostRequestToBackend("order/Return", body, token);

            console.log("Return submission response:", Result);

            if (Result.success) {
                showNotification("Return request submitted successfully!", "success");
                return true;
            }
            if (Result.msg) {
                showNotification(data.msg, "error");
            }
            return false;
        } catch (error) {
            showNotification(`Error submitting return: ${error.message}`, "error");
            return false;
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user])

    const value = {
        orderDetails,
        setOrderDetails,
        submitReturnRequest,
        allOrder,
        user
    }

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
