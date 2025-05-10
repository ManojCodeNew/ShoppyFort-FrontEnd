import React, { useState, useEffect } from "react";
import { useOrderContext } from "./Context/ManageOrderContext.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./styles/ManageOrder.css";
import { useNotification } from "../Notify/NotificationProvider.jsx";
import Loader from "../Load/Loader.jsx";

const ManageOrder = () => {
    const [orders, setOrders] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { ordersData, updateOrderStatus, sendOtpToBackend, getOtpOnDb, fetchOrders } = useOrderContext();
    const [confirmModal, setConfirmModal] = useState({ show: false, orderId: null })
    const { showNotification } = useNotification();
    const [otpModal, setOtpModal] = useState({ show: false, orderId: null, otp: "", expiresAt: null });
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (ordersData && ordersData.length > 0) {
            setOrders([...ordersData].reverse()); // Reverse to show latest orders first
            setIsLoading(false);
        }
        let interval;
        if (otpModal.show && otpModal.expiresAt) {
            interval = setInterval(() => {
                const secondsLeft = Math.floor((otpModal.expiresAt - Date.now()) / 1000);
                setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
            }, 1000)
        }
        return () => clearInterval(interval);
    }, [ordersData, otpModal]);


    const toggleRow = (orderId) => {
        setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const handleConfirm = () => {
        if (confirmModal.orderId) {
            const orderedData = orders.find((order) => order.orderid === confirmModal.orderId);
            if (orderedData) {
                sendOtpNotification(confirmModal.orderId, orderedData.userid);
                showNotification("OTP Sent to the customer", "success");

            }
        }
        setConfirmModal({ show: false, orderId: null }); // Close modal
    };

    const sendOtpNotification = (orderId, userId) => {
        const otp = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit OTP
        const expiresAt = Date.now() + 1 * 60 * 1000; // 1 min
        const newOTP = {
            orderid: orderId,
            userid: userId,
            status: "out-for-delivery",
            otp,
            otpExpiresAt: expiresAt,
        };
        sendOtpToBackend(newOTP);
        setOtpModal(prev => ({ ...prev, show: true, orderId, otp: "", expiresAt }));
        setTimeLeft(60);
    };

    const verifyOtp = async (orderid) => {
        const otpResponse = await getOtpOnDb(orderid);
        if (!otpResponse || !otpResponse.otp) return;

        const otpData = otpResponse.otp;
        const otpExpiryTime = new Date(otpData.otpExpiresAt).getTime();

        if (otpExpiryTime < Date.now()) {
            showNotification("OTP has expired, request a new one", "error");
            setOtpModal({ ...otpModal, show: false });
            return;
        }

        if (parseInt(otpData.otp) === parseInt(otpModal.otp)) {
            showNotification("OTP verified successfully!", "success");
            await updateOrderStatus(orderid, "Delivered");
            await fetchOrders();
            setOtpModal({ ...otpModal, show: false });
        } else {
            showNotification("Invalid OTP, please try again", "error");
        }
    };

    return (
        <div className="order-table-container">
            <h2 className="table-title">Manage Orders</h2>

            {isLoading ? (
                <Loader />
            ) : (
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Delivery Address</th>
                            <th>Items</th>
                            <th>Total Price</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                            <th></th>

                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <React.Fragment key={order.orderid}>
                                <tr>
                                    <td>{order.orderid}</td>
                                    <td>
                                        <strong>{order.userName ? order.userName : "Unknown"}</strong>
                                        <br />
                                        <span className="contact">{order.contactDetails ? order.contactDetails : "No Contact"}</span>
                                    </td>
                                    <td>
                                        {order.shippingaddress?.deliveryaddress}, {order.shippingaddress?.locality}, {order.shippingaddress?.city}
                                        <br />
                                        <span className="state">{order.shippingaddress?.state} - {order.shippingaddress?.pincode}</span>
                                    </td>
                                    <td>{order.items.length}</td>
                                    <td>₹{order.totalprice}</td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</td>
                                    <td>
                                        <span className={`status ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        {order.status !== "Delivered" && order.status !== "Refunded" && (
                                            <>
                                                {order.status === "placed" && (
                                                    <button
                                                        className="action-btn shipped"
                                                        onClick={() => updateOrderStatus(order.orderid, "Shipped")}
                                                    >
                                                        Mark as Shipped
                                                    </button>
                                                )}
                                                {order.status === "Shipped" && (
                                                    <button
                                                        className="action-btn delivered"
                                                        onClick={() => setConfirmModal({ show: true, orderId: order.orderid })}
                                                    >
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                                {order.status !== "Cancelled" && (
                                                    <button
                                                        className="action-btn cancel"
                                                        onClick={() => updateOrderStatus(order.orderid, "Cancelled")}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                                {(order.status === "Delivered" || order.status === "Cancelled") && (
                                                    <button
                                                        className="action-btn cancel"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {otpModal.show && otpModal.orderId == order.orderid && (
                                                    <div className="otp-verification-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                        <p>OTP :</p>
                                                        <input
                                                            type="text"
                                                            name="otp"
                                                            id="otp-input"
                                                            maxLength="4"
                                                            value={otpModal.otp}
                                                            onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value })} />
                                                        <button className="verifyOtp-btn" onClick={() => verifyOtp(order.orderid)} disabled={otpModal.otp.length !== 4 || timeLeft <= 0}>verifyOtp</button>
                                                        {timeLeft > 0 ? (
                                                            <p className="countdown-text">OTP expires in {timeLeft} second{timeLeft !== 1 && "s"}</p>
                                                        ) : (
                                                            <button
                                                                className="resend-otp-btn"
                                                                onClick={() => sendOtpNotification(order.orderid, order.userid)}
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        )
                                                        }
                                                    </div>
                                                )}

                                            </>
                                        )}

                                    </td>
                                    <td>
                                        <button
                                            className="toggle-btn"
                                            onClick={() => toggleRow(order.orderid)}
                                        >
                                            {expandedRows[order.orderid] ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                    </td>

                                </tr>
                                {expandedRows[order.orderid] && (
                                    <tr className="expanded-row">
                                        <td colSpan="8" className="inside-expanded-row">
                                            <div className="address-details">
                                                <h4>Order Details</h4>
                                                <p><strong>Customer:</strong> {order.shippingaddress?.username} - {order.shippingaddress?.mobileno}</p>
                                                <p><strong>Address:</strong> {order.shippingaddress?.deliveryaddress}, {order.shippingaddress?.locality}, {order.shippingaddress?.city}, {order.shippingaddress?.state} - {order.shippingaddress?.pincode}</p>
                                            </div>

                                            <table className="ordered-product-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product Name</th>
                                                        <th>SKU</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((product, index) => (
                                                        <tr key={index}>
                                                            <td>{product.name || "N/A"}</td>
                                                            <td>{product.sku || "N/A"}</td>
                                                            <td>{product.quantity || "N/A"}</td>
                                                            <td>₹{product.price || "N/A"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-content">
                        <h3>Confirm Delivery</h3>
                        <p>Are you sure you want to mark this order as Delivered?</p>
                        <div className="confirm-modal-buttons">
                            <button className="confirm-btn" onClick={handleConfirm}>Yes</button>
                            <button className="confirm-cancel-btn" onClick={() => setConfirmModal({ show: false, orderId: null })}>No</button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ManageOrder;
