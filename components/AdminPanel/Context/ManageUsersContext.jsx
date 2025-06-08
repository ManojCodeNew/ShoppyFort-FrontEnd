import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
import { useNotification } from "@/components/Notify/NotificationProvider.jsx";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Load/Loader";
// Create Context
const UserContext = createContext();
const TOKEN_TYPE = "adminToken";
const ADMIN_AUTH = "adminAuth";

// Create Provider component
export function UserProvider({ children }) {
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Load token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_TYPE);
        if (storedToken) {
            setToken(storedToken);
        } else {
            setIsLoading(false); // done loading even if no token
        }
    }, []);

    useEffect(() => {
        if (!token) {
            return
        }
        if (isTokenExpired(token)) {
            showNotification("Session expired. Please login again.", "error");
            logout();
        } else {
            fetchUsers();
        }
    }, [token]);

    const logout = useCallback(() => {
        showNotification('Logging out...', 'info');
        localStorage.removeItem(ADMIN_AUTH);
        localStorage.removeItem(TOKEN_TYPE);
        showNotification('Logged out successfully!', 'success');
        navigate('/admin/login');
    }, [navigate]);

    // Fetch Users (Authenticated Request)
    const fetchUsers = useCallback(async () => {

        try {
            const usersResult = await sendGetRequestToBackend('admin/dashboard/users', token);
            if (usersResult.success) {
                setAllUsers(usersResult.users);
                setIsLoading(false);
            } else {
                // Handle invalid/expired token
                if (usersResult.error && usersResult.error.toLowerCase().includes("token")) {
                    showNotification("Session expired. Please log in again.", "error");
                    localStorage.removeItem("adminAuth");
                    localStorage.removeItem("adminToken");
                    navigate('/admin/login');
                } else {
                    showNotification(usersResult.error || "Failed to fetch users", "error");
                }
            }
        } catch (error) {
            showNotification("Failed to fetch users", "error");
            console.error("Error fetching users:", error);
            logout();
        }
    }, [token]);

    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // JWT expiry is in seconds
            return Date.now() > expiry;
        } catch (err) {
            console.error("Token decode error:", err);
            return true; // assume expired if error occurs
        }
    }
    
    const value = { allUsers, fetchUsers, token, logout };
    if (isLoading) return <Loader />;

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Create custom hook
export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
}