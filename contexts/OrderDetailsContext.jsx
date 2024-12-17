
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
// Create CartContext
const OrderDetailsContext = createContext();

// CartProvider component to provide context
export const OrderDetailsProvider = ({ children }) => {
    const [orderDetails,setOrderDetails]=useState({
        orderid:'',
        userid:'',
        shippingaddress:'',
        items:[],
        totalprice:0,
        CashOnDelivery:false

    })
console.log("ORDE DATA",orderDetails);

    const value={
        orderDetails,
        setOrderDetails
    }
  
    return (
        <OrderDetailsContext.Provider value={value}>
            {children}
        </OrderDetailsContext.Provider>
    );
};

// Custom hook to use cart context
export const useOrderDetails= () => {
    return useContext(OrderDetailsContext);
};
