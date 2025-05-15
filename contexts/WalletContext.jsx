import { createContext, useCallback, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useNotification } from "@/components/Notify/NotificationProvider";
import sendGetRequestToBackend from "@/components/Request/Get.jsx";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";

const WalletContext = createContext();

export default function WalletProvider({ children }) {
    const { token, user } = useAuth();
    const { showNotification } = useNotification();

    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch wallet details
    const getWallet = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await sendGetRequestToBackend("auth/wallet/getWallet", token);
            if (response.success) {
                console.log("Wallet Money :", response);

                setWallet(response);
            } else {
                showNotification("Failed to fetch wallet", "error");
                setWallet(null);
            }
        } catch (error) {
            console.error("Wallet fetch error:", error);
            showNotification("Network error fetching wallet", "error");
            setWallet(null);
        } finally {
            setLoading(false);
        }
    }, [token, showNotification]);

    const processWalletPayment = async (orderTotalAmt, orderId, paymentMethod) => {
        setLoading(true);
        try {
            const response = await sendPostRequestToBackend("auth/wallet/process-wallet-payment", {
                userid: user._id,
                orderTotalAmt,
                orderid: orderId,
                paymentMethod,
            }, token);
            // userid, orderTotalAmt, orderid, paymentMethod 
            if (response.success) {
                getWallet(); // Refresh wallet balance
                return {
                    success: true,
                    amountPaid: response.amountPaidFromWallet,
                    remaining: response.paymentRequired
                };
            }
            return { success: false };
        } catch (error) {
            console.error("Payment error:", error);
            showNotification("Payment processing failed", "error");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (user) {
            getWallet();
        }
    }, [user, getWallet])

    const value = {
        wallet,
        loading,
        getWallet,
        processWalletPayment
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    return useContext(WalletContext);
};