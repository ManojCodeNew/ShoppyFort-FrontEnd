
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
// Create CartContext
const AddressContext = createContext();

// CartProvider component to provide context
export const AddressProvider = ({ children }) => {
    const [selectedAddressPresence, setSelectedAddressPresence] = useState(null);
    const value = {
        selectedAddressPresence,
        setSelectedAddressPresence
    }
    return (
        <AddressContext.Provider value={value}>
            {children}
        </AddressContext.Provider>
    );
};

// Custom hook to use cart context
export const useAddress = () => {
    return useContext(AddressContext);
};
