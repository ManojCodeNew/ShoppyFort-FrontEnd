import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useProducts } from './ProductsContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
// Create CartContext
const CartContext = createContext();

// CartProvider component to provide context
export const CartProvider = ({ children }) => {
    const { products } = useProducts();
    const [cartItems, setCartItems] = useState([]);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const token = localStorage.getItem('user');
    const user = token && token.split('.').length === 3 ? jwtDecode(token) : null;

    useEffect(() => {
        if (user) {
            fetchCartItems();
        }
    }, [user]);
    // Fetch cart items from the server
    const fetchCartItems = useCallback(async () => {
        if (!user) navigate('/login');
        try {
            const response = await sendGetRequestToBackend(`cart/`, token);

            if (response.success) {
                const cartedProducts = products.filter(product =>
                    response.carts.some(cartItem => cartItem.productid === product._id)
                )
                    .map(product => {
                        // Find the matching cart item
                        const cartItem = response.carts.find(cart => cart.productid === product._id);

                        return {
                            ...product,
                            quantity: cartItem?.quantity || 1,
                            selections: cartItem?.selections || {},
                        };
                    });

                setCartItems(cartedProducts);

            }

        } catch (error) {
            showNotification(`Error fetching cart items : ${error}`, "error");
        }
    }, [user, products]);

    // Add item to cart
    const addItem = useCallback(async (product, selections = {}) => {

        try {
            if (!user) navigate('/login');
            // Use product.quantity or default to 1
            const itemQuantity = product.quantity || 1;

            const body = {
                userid: user.id,
                productid: product._id,
                quantity: itemQuantity,
                selections: selections
            }

            const data = await sendPostRequestToBackend('cart/addCartProduct', body, token);
            if (data.success) {
                // Only update the cart state if the backend operation was successful
                setCartItems(prevCartItems => {
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
    }, [user]);

    // Handle item removal from cart
    const handleRemove = useCallback(async (itemId) => {
        try {
            const response = await sendPostRequestToBackend("cart/removeCart", { productid: itemId }, token);
            if (response.success) {
                setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
                showNotification("Product removed from cart", "success");

            }
        } catch (error) {
            showNotification(`Error removing item: ${error}`, "error");
        }
    }, []);

    // Handle item quantity update
    const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
        try {
            const response = await sendPostRequestToBackend("cart/updateQuantity", { productid: itemId, quantity: newQuantity }, token);
            if (response.success) {
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item._id === itemId ? { ...item, quantity: newQuantity } : item
                    )
                );
            }
        } catch (error) {
            showNotification(`Error updating quantity: ${error}`, "error");
        }
    }, []);


    // Clear cart after successful order
    const clearCart = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend('cart/clear', token);
            if (response.success) {
                // Implement a backend endpoint to clear cart if needed
                setCartItems([]);
            }

        } catch (error) {
            showNotification(`Error clearing cart: ${error}`, "error");
        }
    }, [token]);

    // Calculate total cost of items in the cart
    const totalCost = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalItems = cartItems.length;


    const value = { cartItems, addItem, handleRemove, handleQuantityChange, totalCost, totalItems, clearCart }
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
