import React, { useState, useEffect, useCallback } from "react";
import { useOrderContext } from "./Context/ManageOrderContext.jsx";
import {
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    RefreshCw,
    Clock,
    AlertCircle,
    CheckCircle,
    FileText,
    Package,
    Truck,
    ShoppingBag,
} from "lucide-react";
import "./styles/ManageOrder.css";
import { useNotification } from "../Notify/NotificationProvider.jsx";
import Loader from "../Load/Loader.jsx";

const ManageOrder = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); // New state for filtered orders
    const [expandedRows, setExpandedRows] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { ordersData, updateOrderStatus, sendOtpToBackend, getOtpOnDb, fetchOrders } = useOrderContext();
    const [confirmModal, setConfirmModal] = useState({ show: false, orderId: null, action: null });
    const { showNotification } = useNotification();
    const [otpModal, setOtpModal] = useState({ show: false, orderId: null, otp: "", expiresAt: null });
    const [timeLeft, setTimeLeft] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Number of items per page

    // Status color mapping for consistency
    const statusColors = {
        "placed": "bg-blue-500",
        "shipped": "bg-indigo-500",
        "out-for-delivery": "bg-amber-500",
        "delivered": "bg-green-500",
        "cancelled": "bg-red-500",
        "refunded": "bg-purple-500"
    };

    // Status icon mapping
    const statusIcons = {
        "placed": <ShoppingBag size={16} />,
        "shipped": <Package size={16} />,
        "out-for-delivery": <Truck size={16} />,
        "delivered": <CheckCircle size={16} />,
        "cancelled": <AlertCircle size={16} />,
        "refunded": <RefreshCw size={16} /> // Assuming RefreshCw for refunded, change if better icon exists
    };
    // Helper function to format address display
    const formatAddress = (address) => {
        if (!address) return "No address available";

        const parts = [];
        if (address.buildingNumber) parts.push(address.buildingNumber);
        if (address.streetName) parts.push(address.streetName);
        if (address.area) parts.push(address.area);

        return parts.join(', ') || "Address not specified";
    };

    const formatCityState = (address) => {
        if (!address) return "";

        const parts = [];
        if (address.city) parts.push(address.city);
        if (address.emirate) parts.push(address.emirate);
        if (address.pobox) parts.push(address.pobox);

        return parts.join(', ');
    };

    const getFullAddress = (address) => {
        if (!address) return "No address available";

        const addressLine = formatAddress(address);
        const cityLine = formatCityState(address);
        const country = address.country || "";

        return [addressLine, cityLine, country].filter(Boolean).join(', ');
    };

    useEffect(() => {
        if (ordersData && ordersData.length > 0) {
            setOrders([...ordersData].reverse());
            setFilteredOrders([...ordersData].reverse());
            setIsLoading(false);
        } else if (ordersData && ordersData.length === 0) {
            setOrders([]);
            setFilteredOrders([]);
            setIsLoading(false);
        }
        console.log("Order:", orders);

    }, [ordersData]);

    // Effect for OTP countdown timer
    useEffect(() => {
        let interval;
        if (otpModal.show && otpModal.expiresAt) {
            interval = setInterval(() => {
                const secondsLeft = Math.floor((otpModal.expiresAt - Date.now()) / 1000);
                setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);

                // Auto-close OTP modal if expired
                if (secondsLeft <= 0) {
                    setTimeout(() => {
                        if (otpModal.show) {
                            showNotification("OTP has expired. Please request a new one.", "warning");
                            setOtpModal(prev => ({ ...prev, show: false, otp: "" })); // Close and clear OTP
                        }
                    }, 1000);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpModal, showNotification]);

    // Filtering and search logic
    useEffect(() => {
        let result = [...orders];

        //search filter
        if (searchTerm) {
            result = result.filter(order =>
                order.orderid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.contactDetails && order.contactDetails.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.shippingaddress?.username && order.shippingaddress.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.shippingaddress?.mobileno && String(order.shippingaddress.mobileno).includes(searchTerm)) ||
                (order.shippingaddress?.pobox && String(order.shippingaddress.pobox).includes(searchTerm)) ||
                (order.shippingaddress?.city && order.shippingaddress.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.shippingaddress?.emirate && order.shippingaddress.emirate.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        //filter all
        if (statusFilter !== "all") {
            result = result.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply date filter
        if (dateFilter !== "all") {
            const today = new Date();
            const todayStart = new Date(today.setHours(0, 0, 0, 0));
            const todayEnd = new Date(today.setHours(23, 59, 59, 999));

            if (dateFilter === "today") {
                result = result.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= todayStart && orderDate <= todayEnd;
                });
            } else if (dateFilter === "week") {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                result = result.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= weekStart && orderDate <= today;
                });
            } else if (dateFilter === "month") {
                const monthStart = new Date(today);
                monthStart.setMonth(today.getMonth() - 1);
                result = result.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= monthStart && orderDate <= today;
                });
            }
        }

        setFilteredOrders(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [orders, searchTerm, statusFilter, dateFilter]);

    const toggleRow = (orderId) => {
        setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const handleConfirm = () => {
        if (confirmModal.orderId) {
            if (confirmModal.action === "deliver") {
                const orderedData = orders.find((order) => order.orderid === confirmModal.orderId);
                if (orderedData) {
                    sendOtpNotification(confirmModal.orderId, orderedData.userid);
                    showNotification("OTP sent to the customer for delivery verification.", "info");
                }
            } else if (confirmModal.action === "cancel") {
                updateOrderStatus(confirmModal.orderId, "Cancelled");
                showNotification(`Order ${confirmModal.orderId} has been cancelled.`, "info");
            } else if (confirmModal.action === "delete") {
                showNotification("Order deletion feature is under development.", "info");
            }
        }
        setConfirmModal({ show: false, orderId: null, action: null });
    };

    const sendOtpNotification = (orderId, userId) => {
        const otp = Math.floor(1000 + Math.random() * 9000);
        const expiresAt = Date.now() + 2 * 60 * 1000;
        const newOTP = {
            orderid: orderId,
            userid: userId,
            status: "out-for-delivery",
            otp,
            otpExpiresAt: expiresAt,
        };
        sendOtpToBackend(newOTP);
        setOtpModal(prev => ({ ...prev, show: true, orderId, otp: "", expiresAt }));
        setTimeLeft(120); // 2 minutes in seconds
    };

    const verifyOtp = async (orderid) => {
        // Basic validation
        if (otpModal.otp.length !== 4) {
            showNotification("Please enter a 4-digit OTP.", "warning");
            return;
        }
        if (timeLeft <= 0) {
            showNotification("OTP has expired. Please request a new one.", "error");
            setOtpModal({ ...otpModal, show: false, otp: "" });
            return;
        }
        try {
            const otpResponse = await getOtpOnDb(orderid);

            if (!otpResponse || !otpResponse.otp) {
                showNotification("Failed to retrieve OTP details. Please try again.", "error");
                return;
            }

            const otpData = otpResponse.otp;
            const otpExpiryTime = new Date(otpData.otpExpiresAt).getTime();

            if (otpExpiryTime < Date.now()) {
                showNotification("OTP has expired, request a new one.", "error");
                setOtpModal({ ...otpModal, show: false, otp: "" });
                return;
            }

            if (parseInt(otpData.otp) === parseInt(otpModal.otp)) {
                showNotification("OTP verified successfully!", "success");
                await updateOrderStatus(orderid, "delivered");
                await fetchOrders();
                setOtpModal({ ...otpModal, show: false, otp: "" });
            } else {
                showNotification("Invalid OTP, please try again.", "error");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            showNotification("Error verifying OTP. Please try again.", "error");
        }
    };

    const refreshOrders = async () => {
        setIsLoading(true);
        try {
            await fetchOrders();
            showNotification("Orders refreshed successfully.", "success");
        } catch (error) {
            showNotification("Failed to refresh orders.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    return (
        <div className="order-table-container">
            {isLoading && (
                // This div is crucial to provide a positioned parent for the absolute loader
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9998 }}>
                    <Loader />
                </div>
            )}
            <div className="dashboard-header">
                <h2 className="table-title">Manage Orders</h2>
                <div className="order-stats">
                    <div className="stat-card">
                        <span className="stat-number">
                            {orders.filter((o) => o.status === "placed").length}
                        </span>
                        <span className="stat-label" style={{ color: "black" }}>New Orders</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {orders.filter((o) => o.status === "Shipped").length}
                        </span>
                        <span className="stat-label" style={{ color: "black" }}>Shipped</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {orders.filter((o) => o.status === "delivered").length}
                        </span>
                        <span className="stat-label" style={{ color: "black" }}>Delivered</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {orders.filter((o) => o.status === "Cancelled").length}
                        </span>
                        <span className="stat-label" style={{ color: "black" }}>Cancelled</span>
                    </div>
                </div>
            </div>

            <div className="filters-container">
                <div className="search-container">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, email, or pincode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <div className="filter-select">
                        <label>
                            <Filter size={16} /> Status:
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-dropdown"
                        >
                            <option value="all">All Status</option>
                            <option value="placed">New Order</option>
                            <option value="shipped">Shipped</option>
                            {/* <option value="out-for-delivery">Out for Delivery</option> */}
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            {/* <option value="Refunded">Refunded</option> */}
                        </select>
                    </div>

                    <div className="filter-select">
                        <label>
                            <Clock size={16} /> Date:
                        </label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="filter-dropdown"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                    </div>

                    <button className="refresh-btn" onClick={refreshOrders}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <FileText size={48} />
                    <h3>No orders found</h3>
                    <p>Try changing your search or filter criteria.</p>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>#</th>
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
                                {currentItems.map((order, index) => (
                                    <React.Fragment key={order.orderid}>

                                        <tr className={expandedRows[order.orderid] ? "active-row" : ""}>
                                            <td>{index + 1}</td>
                                            <td className="order-id-cell">{order.orderid}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <strong>
                                                        {order.shippingaddress?.username || order.userName || "Unknown"}
                                                    </strong>
                                                    <span className="contact">
                                                        {order.shippingaddress?.mobileno || order.contactDetails || "No Contact"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="address-info">
                                                    <div>{formatAddress(order.shippingaddress)}</div>
                                                    <div>{formatCityState(order.shippingaddress)}</div>
                                                    {order.shippingaddress?.country && (
                                                        <div>{order.shippingaddress.country}</div>
                                                    )}
                                                </div>
                                            </td>

                                            <td>{order.items?.length || 0}</td>
                                            <td className="price-cell">
                                                AED {order.totalprice.toLocaleString("en-IN")}
                                            </td>
                                            <td>
                                                {order.createdAt ? (
                                                    <div className="date-info">
                                                        <div>{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                                                        <div className="time">
                                                            {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>
                                                <div className={`status-badge ${statusColors[order.status] || "bg-gray-500"}`}>
                                                    {statusIcons[order.status]}
                                                    <span>{order.status}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
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
                                                            onClick={() =>
                                                                setConfirmModal({ show: true, orderId: order.orderid, action: "deliver" })
                                                            }
                                                        >
                                                            Mark as Delivered
                                                        </button>
                                                    )}

                                                    {order.status !== "delivered" && order.status !== "Cancelled" && (
                                                        <button
                                                            className="action-btn cancel"
                                                            onClick={() =>
                                                                setConfirmModal({ show: true, orderId: order.orderid, action: "cancel" })
                                                            }
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>

                                                {/* OTP Verification Section (only visible if otpModal.show for this order) */}
                                                {otpModal.show && otpModal.orderId === order.orderid && (
                                                    <div className="otp-verification-container">
                                                        <div className="otp-header">
                                                            <p>Verification Code</p>
                                                            {timeLeft > 0 && (
                                                                <span className="countdown-badge">
                                                                    <Clock size={14} /> {Math.floor(timeLeft / 60)}:
                                                                    {(timeLeft % 60).toString().padStart(2, "0")}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="otp-input-wrapper">
                                                            <input
                                                                type="text"
                                                                name="otp"
                                                                id="otp-input"
                                                                maxLength="4"
                                                                placeholder="Enter OTP"
                                                                value={otpModal.otp}
                                                                onChange={(e) =>
                                                                    setOtpModal({ ...otpModal, otp: e.target.value.replace(/[^0-9]/g, "") })
                                                                } // Allow only numbers
                                                            />
                                                            <button
                                                                className="verifyOtp-btn"
                                                                onClick={() => verifyOtp(order.orderid)}
                                                                disabled={otpModal.otp.length !== 4 || timeLeft <= 0} // Disable if OTP not 4 digits or expired
                                                            >
                                                                Verify OTP
                                                            </button>
                                                        </div>

                                                        {timeLeft <= 0 && (
                                                            <button
                                                                className="resend-otp-btn"
                                                                onClick={() => sendOtpNotification(order.orderid, order.userid)}
                                                            >
                                                                Resend OTP
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="toggle-btn"
                                                    onClick={() => toggleRow(order.orderid)}
                                                    aria-label={expandedRows[order.orderid] ? "Collapse details" : "Expand details"}
                                                >
                                                    {expandedRows[order.orderid] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows[order.orderid] && (
                                            <tr className="expanded-row">
                                                <td colSpan="9" className="inside-expanded-row">
                                                    <div className="expanded-content">
                                                        <div className="order-detail-section">
                                                            <h4>Order Details</h4>
                                                            <div className="order-detail-grid">
                                                                <div className="detail-item">
                                                                    <span className="detail-label">Order ID:</span>
                                                                    <span className="detail-value">{order.orderid}</span>
                                                                </div>
                                                                <div className="detail-item">
                                                                    <span className="detail-label">Payment Method:</span>
                                                                    <span className="detail-value">{order.paymentMethod || "N/A"}</span>
                                                                </div>
                                                                <div className="detail-item">
                                                                    <span className="detail-label">Payment Status:</span>
                                                                    <span className="detail-value">{order.isPaid ? "Paid" : "Unpaid"}</span>
                                                                </div>
                                                                <div className="detail-item">
                                                                    <span className="detail-label">Order Date:</span>
                                                                    <span className="detail-value">
                                                                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                                                                    </span>
                                                                </div>
                                                                {order.deliveredAt && (
                                                                    <div className="detail-item">
                                                                        <span className="detail-label">Delivered Date:</span>
                                                                        <span className="detail-value">
                                                                            {new Date(order.deliveredAt).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {/* Add more order-specific details here if available from backend */}
                                                            </div>
                                                        </div>

                                                        <div className="customer-detail-section">
                                                            <h4>Customer Details</h4>
                                                            <div className="customer-details">
                                                                <p>
                                                                    <strong>Name:</strong>{" "}
                                                                    {order.shippingaddress?.username || order.userName || "N/A"}
                                                                </p>
                                                                <p>
                                                                    <strong>Contact:</strong>{" "}
                                                                    {order.shippingaddress?.mobileno || "N/A"}
                                                                </p>
                                                                <p>
                                                                    <strong>Email:</strong> {order.contactDetails || "N/A"}
                                                                </p>
                                                                <p>
                                                                    <strong>Shipping Address:</strong>{" "}
                                                                    {getFullAddress(order.shippingaddress)}
                                                                </p>
                                                                <p>
                                                                    <strong>Address Type:</strong>{" "}
                                                                    {order.shippingaddress?.savedaddressas || "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="order-items-section">
                                                            <h4>Ordered Items</h4>
                                                            <table className="ordered-product-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Product Name</th>
                                                                        <th>Quantity</th>
                                                                        <th>Unit Price</th>
                                                                        <th>Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {order.items.map((product, index) => (
                                                                        <tr key={index}>
                                                                            <td>{product.name || "N/A"}</td>
                                                                            <td>{product.quantity || "N/A"}</td>
                                                                            <td>AED {product.price || "N/A"}</td>
                                                                            <td>AED {((product.price || 0) * (product.quantity || 0)).toFixed(2)}</td>
                                                                        </tr>
                                                                    )) || []}
                                                                    <tr className="order-summary-row">
                                                                        <td colSpan="3" className="summary-label">Subtotal</td>
                                                                        <td>AED {(order.totalprice || 0).toFixed(2)}</td>
                                                                    </tr>
                                                                    {order.amountPaidFromWallet > 0 && (
                                                                        <tr className="order-summary-row">
                                                                            <td colSpan="3" className="summary-label">Paid from Wallet</td>
                                                                            <td>AED {order.amountPaidFromWallet.toFixed(2)}</td>
                                                                        </tr>
                                                                    )}
                                                                    {/* Add shipping cost, tax etc. if available */}
                                                                    <tr className="order-total-row">
                                                                        <td colSpan="3" className="total-label">Total Amount</td>
                                                                        <td className="total-value">AED {order.totalprice.toFixed(2)}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="order-timeline">
                                                            <h4>Order Timeline</h4>
                                                            <div className="timeline">
                                                                {/* Order Placed */}
                                                                <div
                                                                    className={`timeline-item ${order.createdAt ? "completed" : ""
                                                                        }`}
                                                                >
                                                                    <div className="timeline-icon">
                                                                        <ShoppingBag size={16} />
                                                                    </div>
                                                                    <div className="timeline-content">
                                                                        <span className="timeline-title">Order Placed</span>
                                                                        {order.createdAt && (
                                                                            <span className="timeline-date">
                                                                                {new Date(order.createdAt).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Order Shipped */}
                                                                <div
                                                                    className={`timeline-item ${order.status === "Shipped" ||
                                                                        order.status === "out-for-delivery" ||
                                                                        order.status === "delivered"
                                                                        ? "completed"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    <div className="timeline-icon">
                                                                        <Package size={16} />
                                                                    </div>
                                                                    <div className="timeline-content">
                                                                        <span className="timeline-title">Order Shipped</span>
                                                                        {/* You'll need a 'shippedAt' timestamp in your order data */}
                                                                        {order.shippedAt && (
                                                                            <span className="timeline-date">
                                                                                {new Date(order.shippedAt).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>


                                                                {/* Order Delivered */}
                                                                <div
                                                                    className={`timeline-item ${order.status === "delivered" ? "completed" : ""}`}
                                                                >
                                                                    <div className="timeline-icon">
                                                                        <CheckCircle size={16} />
                                                                    </div>
                                                                    <div className="timeline-content">
                                                                        <span className="timeline-title">Order Delivered</span>
                                                                        {order.deliveredAt && (
                                                                            <span className="timeline-date">
                                                                                {new Date(order.deliveredAt).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Order Cancelled (if applicable, separate branch for clarity) */}
                                                                {order.status === "Cancelled" && (
                                                                    <div className="timeline-item cancelled">
                                                                        <div className="timeline-icon">
                                                                            <AlertCircle size={16} />
                                                                        </div>
                                                                        <div className="timeline-content">
                                                                            <span className="timeline-title">Order Cancelled</span>
                                                                            {order.updatedAt && ( // Use updatedAt or a specific cancelledAt
                                                                                <span className="timeline-date">
                                                                                    {new Date(order.updatedAt).toLocaleString()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}


                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Action</h3>
                        {confirmModal.action === "deliver" && <p>Are you sure you want to mark this order as Delivered? OTP will be sent for verification.</p>}
                        {confirmModal.action === "cancel" && <p>Are you sure you want to Cancel this order? This action cannot be undone.</p>}
                        {confirmModal.action === "delete" && <p>Are you sure you want to Delete this order? This action is permanent and cannot be undone.</p>}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setConfirmModal({ show: false, orderId: null, action: null })}>
                                No
                            </button>
                            <button className="btn-confirm" onClick={handleConfirm}>
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrder;