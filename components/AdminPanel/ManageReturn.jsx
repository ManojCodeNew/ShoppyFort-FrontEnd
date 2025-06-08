import React, { useState, useEffect, useRef, useCallback } from "react";
import { useManageReturnContext } from "./Context/ManageReturnContext.jsx";
import { useNotification } from "../Notify/NotificationProvider.jsx";
import Loader from "../Load/Loader.jsx";
import './styles/ManageReturn.css';

const ManageReturn = () => {
    const { returns, fetchReturns, updateStatus, deleteReturn, sendReturnOtpToBackend, getReturnOtpOnDb, creditMoneyToWallet } = useManageReturnContext();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, returnId: null, statusToUpdate: null });
    const [otpModal, setOtpModal] = useState({ show: false, returnId: null, otp: "", expiresAt: null, statusToUpdate: null });
    const [timeLeft, setTimeLeft] = useState(0);
    const [walletCreditAttempts, setWalletCreditAttempts] = useState(new Map());
    const [processingCredits, setProcessingCredits] = useState(new Set());

    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            try {
                setLoading(true);
                await fetchReturns();
            } catch (error) {
                console.error("Error fetching returns:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();


        let interval;
        if (otpModal.show && otpModal.expiresAt) {
            interval = setInterval(() => {
                const secondsLeft = Math.floor((otpModal.expiresAt - Date.now()) / 1000);
                setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [fetchReturns, otpModal]);

    const handleAccept = useCallback((id) => {
        updateStatus(id, "approved_by_shop_owner");
        setOpenDropdownId(id);
    }, [updateStatus]);

    const handleReject = useCallback((id) => updateStatus(id, "rejected"), [updateStatus]);
    const toggleDetails = (id) => setExpandedRowId(prev => (prev === id ? null : id));

    const handleStatusChange = (id, status) => {
        if (status === "picked_up" || status === "delivered") {
            setConfirmModal({ show: true, returnId: id, statusToUpdate: status });
        } else {
            updateStatus(id, status);
        }
    };

    const handleConfirmOtpSend = () => {
        const returnData = returns.find(ret => ret._id === confirmModal.returnId);
        const statusToUpdate = confirmModal.statusToUpdate;

        if (returnData) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            const expiresAt = Date.now() + 60 * 1000;
            const otpPayload = {
                returnid: returnData._id,
                userid: returnData.userDetails._id,
                status: statusToUpdate,
                otp,
                otpExpiresAt: expiresAt
            };
            sendReturnOtpToBackend(otpPayload);
            setOtpModal({ show: true, returnId: returnData._id, otp: "", expiresAt, statusToUpdate });
            setTimeLeft(60);
            const messageText = statusToUpdate === "picked_up" ?
                "OTP sent to customer for pickup confirmation" :
                "OTP sent to customer for delivery confirmation";
            showNotification(messageText, "success");
        }
        setConfirmModal({ show: false, returnId: null, statusToUpdate: null });
    };

    const VAT_PERCENTAGE = 0.05;

    function truncateToTwoDecimals(value) {
        return Math.floor(value * 100) / 100;
    }

    const verifyOtp = async (returnId) => {
        const otpResponse = await getReturnOtpOnDb(returnId);
        if (!otpResponse || !otpResponse.otp) return;
        const otpData = otpResponse.otp;
        const otpExpiryTime = new Date(otpData.otpExpiresAt).getTime();

        if (otpExpiryTime < Date.now()) {
            showNotification("OTP has expired, request a new one", "error");
            setOtpModal(prev => ({ ...prev, show: false }));
            return;
        }

        if (parseInt(otpData.otp) === parseInt(otpModal.otp)) {
            const statusToUpdate = otpModal.statusToUpdate;
            const returnData = returns.find(ret => ret._id === returnId);

            // First update the status
            await updateStatus(returnId, statusToUpdate);

            // Handle wallet credit for save_to_wallet returns
            if (statusToUpdate === "picked_up" && returnData?.returntype === "save_to_wallet") {
                const basePrice = returnData.productDetails?.price || 0;
                const quantity = returnData.productDetails?.quantity || 1;
                // Convert price to paise (integer)
                const totalPriceInPaise = Math.round(basePrice * 100) * quantity;
                // Calculate VAT in paise (5%)
                const vatInPaise = Math.round(totalPriceInPaise * VAT_PERCENTAGE);
                // Total amount in paise (price + VAT)
                const totalAmountInPaise = totalPriceInPaise + vatInPaise;
                // Convert paise back to rupees and truncate to 2 decimals
                const totalAmount = truncateToTwoDecimals(totalAmountInPaise / 100);

                const walletCreditSuccess = await creditMoneyToWallet(returnId, totalAmount);

                if (walletCreditSuccess) {
                    await updateStatus(returnId, "wallet_credited");
                    const successMessage = "OTP verified successfully - Product picked up and amount credited to wallet";
                    showNotification(successMessage, "success");

                    setOtpModal(prev => ({ ...prev, show: false }));
                    await fetchReturns();
                } else {
                    showNotification("OTP verified but wallet credit failed. Please try again.", "error");
                    return;
                }
            } else {
                const successMessage = statusToUpdate === "picked_up" ?
                    "OTP verified successfully - Product picked up" :
                    "OTP verified successfully - Delivery confirmed";

                showNotification(successMessage, "success");

                setOtpModal(prev => ({ ...prev, show: false }));
                await fetchReturns();
            }
        } else {
            showNotification("Invalid OTP", "error");
        }
    };

    const renderActions = (item) => {
        const isReplacement = item.returntype === "replacement";
        const isSaveToWallet = item.returntype === "save_to_wallet";

        switch (item.status) {
            case "return_requested":
                return (
                    <>
                        <button className="btn primary" onClick={() => handleAccept(item._id)}>Accept</button>
                        <button className="btn secondary" onClick={() => handleReject(item._id)}>Reject</button>
                    </>
                );
            case "approved_by_shop_owner":
            case "pickup_scheduled":
                return (
                    <select
                        value=""
                        autoFocus={openDropdownId === item._id}
                        onBlur={() => setOpenDropdownId(null)}
                        onChange={(e) => {
                            const selectedStatus = e.target.value;
                            if (selectedStatus) {
                                handleStatusChange(item._id, selectedStatus);
                            }
                        }}
                    >
                        <option value="">Select Status</option>
                        {item.status === "approved_by_shop_owner" && (
                            <option value="pickup_scheduled">📦 Pickup Scheduled</option>
                        )}
                        {item.status === "pickup_scheduled" && (
                            <option value="picked_up">✔ Picked Up</option>
                        )}
                    </select>
                );
            case "picked_up":

                if (isReplacement) {
                    return (
                        <select
                            value=""
                            onChange={(e) => {
                                const selectedStatus = e.target.value;
                                if (selectedStatus) {
                                    handleStatusChange(item._id, selectedStatus);
                                }
                            }}
                        >
                            <option value="">Select Status</option>
                            <option value="replacement_shipped">🚚 Replacement Shipped</option>
                        </select>
                    );
                } else if (isSaveToWallet) {
                    return <span className="status-completed">Processing Wallet Credit...</span>;
                }
                return null;
            case "wallet_credited":
                return isSaveToWallet ? (
                    <span className="status-completed">Completed - Amount Credited to Wallet</span>
                ) : null;
            case "replacement_shipped":
                return isReplacement ? (
                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                handleStatusChange(item._id, e.target.value);
                            }
                        }}
                    >
                        <option value="">Select Status</option>
                        <option value="delivered">📬 Delivered</option>
                    </select>
                ) : null;
            case "delivered":
                return isReplacement ? (
                    <span className="status-completed">
                        Completed - Replacement Delivered
                    </span>
                ) : null;
            case "rejected":
                return <span className="status-rejected">Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="returns-container">
            <h2>Manage Returns</h2>
            {loading ? (
                <Loader />
            ) : returns.length === 0 ? (
                <p>No return requests found.</p>
            ) : (
                <table className="returns-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Reason</th>
                            <th>Return Type</th>
                            <th>Return Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...returns].reverse().map((item, index) => {
                            const isExpanded = expandedRowId === item._id;
                            return (
                                <React.Fragment key={item._id}>
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{item.orderDetails?.orderid}</td>
                                        <td>{item.userDetails?.fullname || "Unknown"}</td>
                                        <td>{item.reason}</td>
                                        <td>{item.returntype}</td>
                                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                                        <td>{item.status} </td>
                                        <td>
                                            <button onClick={() => toggleDetails(item._id)} className="expand-btn">
                                                {isExpanded ? "▲" : "▼"}
                                            </button>
                                            {renderActions(item)}

                                            {otpModal.show && otpModal.returnId === item._id && (
                                                <div className="otp-verification-container">
                                                    <p>OTP:</p>
                                                    <input
                                                        type="text"
                                                        maxLength="4"
                                                        value={otpModal.otp}
                                                        onChange={(e) => setOtpModal(prev => ({ ...prev, otp: e.target.value }))}
                                                        placeholder="Enter OTP"
                                                    />
                                                    <button
                                                        className="verifyOtp-btn"
                                                        onClick={() => verifyOtp(item._id)}
                                                        disabled={otpModal.otp.length !== 4 || timeLeft <= 0}
                                                    >
                                                        Verify OTP
                                                    </button>
                                                    {timeLeft > 0 ? (
                                                        <p className="countdown-text">OTP expires in {timeLeft} seconds</p>
                                                    ) : (
                                                        <button onClick={() => handleConfirmOtpSend()}>
                                                            Resend OTP
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="product-details-row">
                                            <td colSpan="8">
                                                <div className="product-details-section">
                                                    <div className="product-details-content">
                                                        <img
                                                            src={item.productDetails?.defaultImg || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"}
                                                            alt={item.productDetails?.name || "Product"}
                                                            className="product-image"
                                                        />
                                                        <div className="product-details-meta">
                                                            <span><strong>Product:</strong> {item.productDetails?.name || "Unknown"}</span>
                                                            <span><strong>Qty:</strong> {item.productDetails?.quantity || "N/A"}</span>
                                                            <span><strong>Price:</strong> ₹{item.productDetails?.price || "N/A"}</span>
                                                            <span><strong>Color:</strong> {item.productDetails?.selections?.color || "N/A"}</span>
                                                            <span><strong>Size:</strong> {item.productDetails?.selections?.size || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Confirm Modal */}
            {confirmModal.show && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-content">
                        <h3>Confirm Pick Up</h3>
                        <p>Send OTP to customer to confirm product pickup?</p>
                        <div className="confirm-modal-buttons">
                            <button className="confirm-btn" onClick={handleConfirmOtpSend}>Yes</button>
                            <button className="confirm-cancel-btn" onClick={() => setConfirmModal({ show: false, returnId: null })}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReturn;