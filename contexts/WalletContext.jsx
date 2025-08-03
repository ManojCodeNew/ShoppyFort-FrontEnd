import { createContext, useCallback, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useNotification } from "@/components/Notify/NotificationProvider";
import sendGetRequestToBackend from "@/components/Request/Get.jsx";
import sendPostRequestToBackend from "@/components/Request/Post.jsx";

const WalletContext = createContext();
// Initial wallet state
const initialWalletState = {
    balance: 0,
    transactions: [],
    currency: 'AED',
    lastUpdated: null
};
export default function WalletProvider({ children }) {
    const { token, user, isAuthenticated, userDataLoaded } = useAuth();
    const { showNotification } = useNotification();

    const [wallet, setWallet] = useState(initialWalletState);
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Fetch wallet details
    const getWallet = useCallback(async (forceFetch = false) => {
        if (!token || !user?._id || !isAuthenticated) {
            console.log('Skipping wallet fetch - missing token, user, or not authenticated');
            setWallet(initialWalletState);
            setInitialized(true);
            setLoading(false);
            return;
        }
        // Skip fetch if already loading and not forced
        if (loading && !forceFetch) {
            return;
        }
        setLoading(true);
        try {
            const response = await sendGetRequestToBackend("auth/wallet/getWallet", token);
            console.log("Wallet fetch response:", response);
            if (response?.success && response?.wallet) {
                console.log("Wallet fetched successfully:", response);
                setWallet({
                    balance: response.wallet.balance || 0,
                    transactions: response.wallet.transactions || [],
                    currency: 'AED',
                    lastUpdated: new Date().toISOString()
                });
            } else {
                setWallet(initialWalletState);

                if (response?.error && !response.error.includes('not found')) {
                    showNotification(response.error, "error");
                }
            }
        } catch (error) {
            console.error("Wallet fetch error:", error);
            showNotification("Network error fetching wallet", "error");
            setWallet(initialWalletState);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [token, user?._id, isAuthenticated, showNotification]);

    const processWalletPayment = useCallback(async (orderTotalAmt, orderId, paymentMethod) => {

        if (!user?._id) {
            showNotification("User not authenticated", "error");
            return {
                success: false,
                error: "User not authenticated",
                code: "UNAUTHENTICATED"
            };
        }
        if (processingPayment) {
            return {
                success: false,
                error: "Payment already in progress",
                code: "PAYMENT_IN_PROGRESS"
            };
        }

        setProcessingPayment(true);
        try {
            const response = await sendPostRequestToBackend("auth/wallet/process-wallet-payment", {
                userid: user._id,
                orderTotalAmt,
                orderid: orderId,
                paymentMethod,
            }, token);
            if (!response) {
                throw new Error("No response from server");
            }
            // userid, orderTotalAmt, orderid, paymentMethod 
            if (response.success) {
                setWallet(prev => ({
                    ...prev,
                    balance: response.newBalance || prev.balance,
                    transactions: [
                        {
                            _id: new Date().getTime().toString(),
                            amount: response.amountPaidFromWallet || 0,
                            orderid: orderId,
                            date: new Date().toISOString(),
                            type: 'debit',
                            note: `Payment for order ${orderId}`,
                            status: 'completed'
                        },
                        ...(prev.transactions || [])
                    ],
                    lastUpdated: new Date().toISOString()
                }));
                // Fetch wallet again to ensure consistency with backend
                await getWallet(true);
                return {
                    success: true,
                    amountPaid: response.amountPaidFromWallet || 0,
                    remaining: response.remainingAmount || 0,
                    paymentMethod: response.paymentMethod,
                    newBalance: response.newBalance
                };
            } else {
                showNotification(response.error || "Payment processing failed", "error");
                return {
                    success: false,
                    error: response.error || "Payment failed",
                    code: response.code || "PAYMENT_FAILED"
                };
            }
        } catch (error) {
            console.error("Payment error:", error);
            showNotification("Payment processing failed", "error");
            return {
                success: false,
                error: error.message || "Network error",
                code: "NETWORK_ERROR"
            };
        } finally {
            setProcessingPayment(false);
        }
    }, [user?._id, token, showNotification, processingPayment, getWallet]);

    // Initialize wallet once when user and token are available
    useEffect(() => {
        if (user?._id && token && isAuthenticated && userDataLoaded && !initialized) {
            console.log("Initializing wallet for user:", user._id);
            getWallet();
        } else if (!isAuthenticated) {
            setWallet(initialWalletState);
            setInitialized(true);
        }
    }, [user?._id, token, isAuthenticated, userDataLoaded, initialized, getWallet]);

    // Provide a function to manually refresh wallet data
    const refreshWallet = useCallback(() => {
        getWallet(true); // Force fetch to bypass loading check
    }, [getWallet]);

    const value = {
        wallet,
        loading,
        getWallet,
        processWalletPayment,
        paymentProcessing: processingPayment,
        initialized,
        refreshWallet
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