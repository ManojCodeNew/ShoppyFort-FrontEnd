
import sendGetRequestToBackend from '@/components/Request/Get';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
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
    const [allOrder,setAllOrder]=useState([]);

    const token = localStorage.getItem('user');
    const user = token ? jwtDecode(token) : null;

    const fetchOrders = async () => {
        const response = await sendGetRequestToBackend("order",token);
        if (response.success) {
            setAllOrder(response.orders);
        }
    };
    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user])

    const value = {
        orderDetails,
        setOrderDetails,
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
