import React, { createContext, useContext, useMemo, useState } from "react";
import Notification from "../Notify/Notification.jsx";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });

        // Auto close after 3 seconds
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const closeNotification = () => {
        setNotification(null);
    };
    const value = useMemo(() => ({
        showNotification,
    }), [showNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
