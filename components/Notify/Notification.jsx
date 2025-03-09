import React, { useEffect } from "react";
import "./Notification.css"; // Import CSS file

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
            return () => clearTimeout(timer); // Cleanup on unmount
        }
    }, [message, onClose]);
    if (!message) return null;
    return (
        <div className={`notification ${type === "success" ? "success" : "error"}`}>
            {message}
            <button className="close-btn" onClick={onClose}>×</button>
        </div>
    );
};

export default Notification;
