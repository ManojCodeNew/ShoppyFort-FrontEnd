import sendGetRequestToBackend from "@/components/Request/Get";
import { Children, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import { useAuth } from "./AuthContext.jsx";
import moment from "moment";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";
import { useLocation } from "react-router-dom";
// create a context
const UserNotificationsContext = createContext();

export default function UserNotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const { token, user, isAuthenticated, userDataLoaded } = useAuth(); // Get user and token from AuthContext
    const [lastOtpId, setLastOtpId] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const location = useLocation();
    const getNotifications = useCallback(async (isInitial = false) => {
        try {
            if (!token || !isAuthenticated) {
                setNotifications([]);
                setLoading(false);
                return;
            }
            
            if (isInitial) setLoading(true);
            const notificationResponse = await sendGetRequestToBackend('auth/notifications', token);
            if (notificationResponse.success) {
                const updatedNotifications = notificationResponse.otp.map((notif) => ({
                    ...notif,
                    read: notif.read,
                    timeAgo: moment(notif.updatedAt).fromNow(),
                }))

                const newest = updatedNotifications[0];
                if (newest && newest._id !== lastOtpId && !newest.read) {
                    const isOrder = !!newest.orderid;
                    const entityId = isOrder ? newest.orderid : newest.returnid;
                    const message = isOrder
                        ? `Use OTP ${newest.otp} to confirm delivery of order ${entityId}. Don't share it with anyone! 🔐`
                        : `Use OTP ${newest.otp} to confirm pickup of return. Don't share it with anyone! 🔐`;


                    showNotification(message, "info");
                    setLastOtpId(newest._id); // update last shown OTP
                }

                // Only set state if changed
                const areEqual = (a, b) =>
                    a.length === b.length && a.every((n, i) => n._id === b[i]._id && n.read === b[i].read);

                if (!areEqual(notifications, updatedNotifications)) {
                    setNotifications(updatedNotifications);
                }
                // const isSame = JSON.stringify(notifications.map(n => n._id)) === JSON.stringify(updatedNotifications.map(n => n._id));
                // if (!isSame) {
                //     setNotifications(updatedNotifications);
                // }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            if (isInitial) showNotification("Failed to fetch notifications", "error");
            setNotifications([]);
        } finally {
            if (isInitial) {
                setLoading(false);
                setInitialLoadDone(true);
            }
        }

    }, [token, isAuthenticated, lastOtpId, showNotification]);

    // Polling to fetch notifications every 30 seconds
    useEffect(() => {
        // Only poll if authenticated and NOT on the notifications page
        if (token && isAuthenticated && userDataLoaded && location.pathname !== "/notifications") {
            getNotifications(true);
            const interval = setInterval(() => {
                getNotifications(false);
            }, 30000); // 30 seconds
            setPollingInterval(interval);
            return () => {
                clearInterval(interval);
            };
        } else {
            // If not authenticated or on notifications page, clear any existing interval
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
            if (!isAuthenticated) {
                setNotifications([]);
            }
        }
        // eslint-disable-next-line
    }, [getNotifications, location.pathname, token, isAuthenticated, userDataLoaded]);

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

    const getWallet = useCallback(async () => {
        try {
            const response = await sendGetRequestToBackend('auth/wallet/getWallet', token);
            return response;
        } catch (error) {
            console.error("Error fetching wallet:", error);
            return { success: false, error: "Network error" };

        }

    }, [token])

    const hasUnread = notifications.some((notif) => !notif.read);


    const value = useMemo(() => ({
        getNotifications,
        notifications,
        setNotifications,
        markAsRead,
        hasUnread,
        getWallet
    }),[getNotifications, notifications, markAsRead, hasUnread, getWallet]);
    return (
        <UserNotificationsContext.Provider value={value}>
            {children}
        </UserNotificationsContext.Provider>
    )
}

export const useUserNotifications = () => {
    return useContext(UserNotificationsContext);
}