import React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import sendGetRequestToBackend from "@/components/Request/Get";
import { useNotification } from "@/components/Notify/NotificationProvider";

// Create Context
const UserContext = createContext();

// Create Provider component
export function UserProvider({ children }) {
    const [allUsers, setAllUsers] = useState([]);
    const token = localStorage.getItem("user"); // Get JWT Token
    const { showNotification } = useNotification();

    // Fetch Users (Authenticated Request)
    const fetchUsers = useCallback(async () => {
        if (!token) return;

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
    }, [token, showNotification]);

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, fetchUsers]);

    const value = { allUsers, fetchUsers };

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