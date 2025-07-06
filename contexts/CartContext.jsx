import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { useAuth } from './AuthContext.jsx';

// Create CartContext
const CartContext = createContext();
const SHIPPING_PRICE = 10;
const SHIPPING_PRICE_LIMIT = 100.00;

// CartProvider component to provide context
export const CartProvider = ({ children }) => {
    const { products } = useProducts();
    const [cartItems, setCartItems] = useState([]);
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [calculatedTotal, setCalculatedTotal] = useState({
        totalCostwithVAT: '0.00',
        VAT_Price: '0.00',
        totalCostwithoutVAT: '0.00',
        added_Shipping_Price: 0,
        totalItems: 0,
    });
    // Fetch cart items from the server
    const fetchCartItems = useCallback(async () => {
        if (!token) return navigate('/login');
        try {
            const response = await sendGetRequestToBackend(`cart/`, token);

            if (response.success) {
                const cartedProducts = products.filter(product =>
                    response.carts.some((cartItem) => cartItem.productid === product._id)
                )
                    .map(product => {
                        // Find the matching cart item
                        const cartItem = response.carts.find((cart) => cart.productid === product._id);

                        return {
                            ...product,
                            quantity: cartItem?.quantity || 1,
                            selections: cartItem?.selections || {},
                        };
                    });

                setCartItems(cartedProducts);

            } else {
                showNotification("Error fetching cart items", "error");
            }

        } catch (error) {
            showNotification(`Error fetching cart items : ${error}`, "error");
        }
    }, [token, products, navigate, showNotification]);

    useEffect(() => {
        if (user && Array.isArray(products) && products.length > 0) {
            fetchCartItems();
        }
    }, [user, products.length, fetchCartItems]);

    const calculateTotalCost = useCallback(() => {
        let totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

        if (totalItems === 0) {
            setCalculatedTotal({
                totalCostwithVAT: '0.00',
                VAT_Price: '0.00',
                totalCostwithoutVAT: '0.00',
                added_Shipping_Price: 0,
                totalItems: 0,
            });
            return;
        }

        const totalCostInPaise = cartItems.reduce((sum, item) => {
            const priceInPaise = Math.round(item.price * 100);
            return sum + (item.quantity || 1) * priceInPaise;
        }, 0);

        const VAT_Price_in_paise = Math.round(totalCostInPaise * 0.05);
        let totalWithVATInPaise = totalCostInPaise + VAT_Price_in_paise;

        let shippingFee = 0;
        if (totalWithVATInPaise < SHIPPING_PRICE_LIMIT * 100) {
            shippingFee = SHIPPING_PRICE * 100;
            totalWithVATInPaise += shippingFee;
        }

        setCalculatedTotal({
            totalCostwithVAT: (totalWithVATInPaise / 100).toFixed(2),
            VAT_Price: (VAT_Price_in_paise / 100).toFixed(2),
            totalCostwithoutVAT: (totalCostInPaise / 100).toFixed(2),
            added_Shipping_Price: shippingFee > 0 ? SHIPPING_PRICE : 0,
            totalItems: totalItems,
        });
    }, [cartItems]);

    useEffect(() => {
        calculateTotalCost();
    }, [cartItems, calculateTotalCost]);

    // Add item to cart
    const addItem = useCallback(async (product, selections = {}) => {

        try {
            if (!user) return navigate('/login');
            // Use product.quantity or default to 1
            const itemQuantity = product.quantity || 1;

            // hecks current product stock is 0
            if (product.stock === 0) {
                showNotification(`Sorry, '${product.name}' is out of stock.`, 'error');
                return;
            }

            if (itemQuantity > product.stock) {
                showNotification(`Only ${product.stock} items available in stock`, 'error');
                return;
            }

            const body = {
                userid: user._id,
                productid: product._id,
                quantity: itemQuantity,
                selections: selections
            }


            const data = await sendPostRequestToBackend('cart/addCartProduct', body, token);
            if (data.success) {
                // If cart item already there in cartitem it will just append it
                setCartItems(prevCartItems => {
                    const existingIndex = prevCartItems.findIndex(item => item._id === product._id);
                    if (existingIndex >= 0) {
                        const updatedItems = [...prevCartItems];
                        updatedItems[existingIndex].quantity = Math.min(
                            updatedItems[existingIndex].quantity + itemQuantity,
                            product.stock
                        );
                        return updatedItems;
                    }
                    return [...prevCartItems, { ...product, quantity: itemQuantity, selections }];
                });
                showNotification(data.success, "success");
            }
            if (data.error) {
                showNotification(data.error, "error");
            }

        } catch (error) {
            showNotification(`Error adding item to cart: ${error}`, "error");
        }
    }, [user, token, navigate, showNotification]);

    // Handle item removal from cart
    const handleRemove = useCallback(async (itemId) => {
        try {
            const response = await sendPostRequestToBackend("cart/removeCart", { productid: itemId }, token);
            if (!response.success) {
                showNotification("Failed to remove product", "error");
            }
            setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
            showNotification("Product removed from cart", "success");


        } catch (error) {
            showNotification(`Error removing item: ${error}`, "error");
        }
    }, [token, showNotification]);

    // Handle item quantity update
    const handleQuantityChange = useCallback(async (itemId, newQuantity, selections) => {
        try {
            if (newQuantity < 1) return;

            const item = cartItems.find(item =>
                item._id === itemId &&
                item.selections?.color === selections.color &&
                item.selections?.size === selections.size
            );

            if (!item) return;

            if (newQuantity > item.stock) {
                showNotification(`Only ${item.stock} items available in stock`, "error");
                return;
            }

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === itemId &&
                        item.selections?.color === selections.color &&
                        item.selections?.size === selections.size
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );


            const response = await sendPostRequestToBackend("cart/updateQuantity", { productid: itemId, quantity: newQuantity }, token);
            if (!response?.success) {
                showNotification("Failed to update quantity", "error");
                fetchCartItems();
            }
        } catch (error) {
            showNotification(`Error updating quantity: ${error}`, "error");
            fetchCartItems();
        }
    }, [token, fetchCartItems, cartItems]);


    // Clear cart after successful order
    const clearCart = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend('cart/clear', token);
            if (response.success) {
                setCartItems([]);
                setCalculatedTotal({
                    totalCostwithVAT: '0.00',
                    VAT_Price: '0.00',
                    totalCostwithoutVAT: '0.00',
                    added_Shipping_Price: 0,
                    totalItems: 0,
                });
            }

        } catch (error) {
            showNotification(`Error clearing cart: ${error}`, "error");
        }
    }, [token]);


    const value = {
        cartItems,
        addItem,
        handleRemove,
        handleQuantityChange,
        clearCart,
        fetchCartItems,
        ...calculatedTotal,
        calculateTotalCost
    }
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    return useContext(CartContext);
};
