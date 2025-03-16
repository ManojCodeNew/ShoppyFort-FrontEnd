import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useProducts } from './ProductsContext';
import { useNavigate } from 'react-router-dom';
// Create CartContext
const CartContext = createContext();

// CartProvider component to provide context
export const CartProvider = ({ children }) => {
    const { products } = useProducts();
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('user');
    const user = token ? jwtDecode(token) : null;

    useEffect(() => {
        if (user) {
            fetchCartItems();
        }
    }, [user]);
    // Fetch cart items from the server
    const fetchCartItems = useCallback(async () => {
        if (!user) return;
        try {
            const response = await sendGetRequestToBackend(`cart/`,token);

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
                            selections: cartItem?.selections || {}
                        };
                    });

                setCartItems(cartedProducts);

            }

        } catch (error) {
            console.error("Error fetching cart items", error);
        }
    }, [user, products]);

    // Add item to cart
    const addItem = useCallback(async (product, selections = {}) => {

        try {
            if (!user) return;
            const body = {
                userid: user.id,
                productid: product._id,
                quantity: product.quantity,
                selections: selections
            }

            const data = await sendPostRequestToBackend('cart/addCartProduct', body, token);
            if (data.success) {
                setCartItems((prevCartItems) => {
                    // Check if the product already exists in the cart
                    const existingItem = prevCartItems.find((item) => item._id === product._id);
                    if (existingItem) {
                        // Update quantity if product exists
                        return prevCartItems.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + product.quantity }
                                : item
                        );
                    } else {
                        // Add new product to the cart
                        return [...prevCartItems, product];
                    }
                });
            }
            if (data.msg) {
                alert(data.msg);
            }

        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    }, [user]);

    // Handle item removal from cart
    const handleRemove = useCallback(async (itemId) => {
        try {
            const response = await sendPostRequestToBackend("cart/removeCart", { productid: itemId },token);
            if (response.success) {
                console.log("handleRemove", response.success);

                setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    }, []);

    // Handle item quantity update
    const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
        try {
            const response = await sendPostRequestToBackend("cart/updateQuantity", { productid: itemId, quantity: newQuantity },token);
            if (response.success) {
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item._id === itemId ? { ...item, quantity: newQuantity } : item
                    )
                );
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }, []);

    // Calculate total cost of items in the cart
    const totalCost = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalItems = cartItems.length;


    const value = { cartItems, addItem, handleRemove, handleQuantityChange, totalCost, totalItems }
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
