import sendGetRequestToBackend from "@/components/Request/Get";
import { Children, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useAuth } from "./AuthContext.jsx";
import moment from "moment";
// create a context
const UserNotificationsContext = createContext();

export default function UserNotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { showNotification } = useNotification();
    const { token, user } = useAuth(); // Get user and token from AuthContext
    const getNotifications = useCallback(async () => {
        const notificationResponse = await sendGetRequestToBackend('auth/notifications/', token);
        if (notificationResponse.success) {
            const updatedNotifications = notificationResponse.otp.map((notif) => ({
                ...notif,
                read: false,
                timeAgo: moment(notif.updatedAt).fromNow(),

            }))

            showNotification(`Use OTP ${updatedNotifications[0].otp} to receive your order ${updatedNotifications[0].orderid}. Don't share it with anyone! 🔐`, "info")
            setNotifications(updatedNotifications);
        } else {
            setNotifications([]);
        }
    }, [token]);

    useEffect(() => {
        getNotifications();
    }, [getNotifications])
    const value = {
        getNotifications,
        notifications,
        setNotifications
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