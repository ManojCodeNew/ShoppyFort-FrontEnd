import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
import { useNotification } from "@/components/Notify/NotificationProvider.jsx";
import { useNavigate } from "react-router-dom";

// Create Context
const UserContext = createContext();
const TOKEN_TYPE = "adminToken";

// Create Provider component
export function UserProvider({ children }) {
    const [allUsers, setAllUsers] = useState([]);
    const token = localStorage.getItem(TOKEN_TYPE); // Get JWT Token
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Fetch Users (Authenticated Request)
    const fetchUsers = useCallback(async () => {
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const usersResult = await sendGetRequestToBackend('admin/dashboard/users', token);
            if (usersResult.success) {
                setAllUsers(usersResult.users);
            } else if (usersResult.error) {
                showNotification(usersResult.error, "error");
            }
        } catch (error) {
            showNotification("Failed to fetch users", "error");
            console.error("Error fetching users:", error);
        }
    }, [token, showNotification, navigate]);

    const logout = useCallback(() => {
        showNotification('Logging out...', 'info');

        setTimeout(() => {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem(TOKEN_TYPE);
            showNotification('Logged out successfully!', 'success');
            navigate('/admin/login');
        }, 800);
    }, [navigate]);

    useEffect(() => {
        if (token) {
            fetchUsers();
        } else {
            navigate("/admin/login");
        }
    }, [token, showNotification]);

    const value = { allUsers, fetchUsers, token, logout };

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