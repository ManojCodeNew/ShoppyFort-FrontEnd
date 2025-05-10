import sendGetRequestToBackend from "@/components/Request/Get";
import { Children, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useAuth } from "./AuthContext.jsx";
import moment from "moment";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";
// create a context
const UserNotificationsContext = createContext();

export default function UserNotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth(); // Get user and token from AuthContext
    const [lastOtpId, setLastOtpId] = useState(null);

    const getNotifications = useCallback(async () => {
        const notificationResponse = await sendGetRequestToBackend('auth/notifications/', token);
        if (notificationResponse.success) {

            const updatedNotifications = notificationResponse.otp.map((notif) => ({
                ...notif,
                read: notif.read,
                timeAgo: moment(notif.updatedAt).fromNow(),
            }))

            const newest = updatedNotifications[0];
            if (newest && newest._id !== lastOtpId) {
                const isOrder = !!newest.orderid;
                const entityId = isOrder ? newest.orderid : newest.returnid;
                const message = isOrder
                    ? `Use OTP ${newest.otp} to confirm delivery of order ${entityId}. Don't share it with anyone! 🔐`
                    : `Use OTP ${newest.otp} to confirm pickup of return. Don't share it with anyone! 🔐`;


                showNotification(message, "info");
                setLastOtpId(newest._id); // update last shown OTP
            }
            setNotifications(updatedNotifications);
        } else {
            setNotifications([]);
        }
    }, [token, lastOtpId, showNotification]);
    console.log("Notifi :", notifications);


    const markAsRead = useCallback(async (id) => {
        const response = await sendPostRequestToBackend('auth/notifications/mark_as_read', { id }, token);
        if (response.success) {
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === id ? { ...notif, read: true } : notif
                )
            );
        } else {
            showNotification("Failed to mark notification as read.", "error");
        }
    }, [token, showNotification]);
    
    useEffect(() => {
        getNotifications();
    }, [getNotifications]);
    const hasUnread = notifications.some((notif) => !notif.read);


    const value = {
        getNotifications,
        notifications,
        setNotifications,
        markAsRead,
        hasUnread
    }
    return (
        <UserNotificationsContext.Provider value={value}>
            {children}
        </UserNotificationsContext.Provider>
    )
}

export const useUserNotifications = () => {
    return useContext(UserNotificationsContext);
}