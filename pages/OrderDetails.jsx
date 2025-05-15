import React, { useEffect, useState } from 'react';
import '../styles/pages/OrderDetails.scss';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';
import { useNotification } from '@/components/Notify/NotificationProvider';

function OrderDetails() {
    const { allOrder, submitReturnRequest, allReturns, cancelOrder, fetchOrders } = useOrderDetails();
    const [activeReturnReasons, setActiveReturnReasons] = useState(null);
    const [activeReturnId, setActiveReturnId] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [returnStatus, setReturnStatus] = useState("Waiting...");
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const { showNotification } = useNotification();

    const returnReasons = [
        "Wrong size ordered",
        "Product damaged",
        "Not as described",
        "Changed my mind",
        "Other reason"
    ];

    const [returnData, setReturnData] = useState({
        orderId: null,
        productId: null,
        reason: '',
        otherReason: '',
        returnType: '',
        quantity: 1,
        isSubmitting: false
    });
    useEffect(() => {
        // Update return status if needed based on allReturns
        if (allReturns && returnData.productId && returnData.orderId) {
            const activeReturn = allReturns.find(r => r.productid === returnData.productId && r.orderid === returnData.orderId);
            if (activeReturn) {
                setReturnStatus(activeReturn.status);
            }
        }
    }, [allReturns, returnData.productId, returnData.orderId])

    const toggleReturnDropdown = (productId, orderId) => {
        const order = allOrder.find(o => o._id === orderId);
        const product = order?.items?.find(p => p._id === productId);

        // Don't allow toggling if there's already a return for this product
        if (allReturns && allReturns.some(r => r.productid === productId && r.orderid === orderId)) {
            return; // Don't toggle if already returned
        }
        const key = `${productId}-${orderId}`;
        setActiveReturnReasons(activeReturnReasons === key ? null : key);
        setReturnData({
            ...returnData,
            orderId,
            productId,
            reason: '',
            otherReason: '',
            returnType: '',
            quantity: product.quantity || 1,
            isSubmitting: false
        });
    }

    const handleReasonSelect = (reason, productId) => {
        setReturnData(prev => ({
            ...prev,
            productId,
            reason,
            otherReason: '',
            returnType: ''
        }));
        setActiveReturnReasons(null);
    };

    const handleOtherReasonChange = (e) => {
        setReturnData({
            ...returnData,
            otherReason: e.target.value
        });
    };
    const handleReturnTypeChange = (e) => {
        setReturnData(prev => ({ ...prev, returnType: e.target.value }));
    };

    const handleCancelOrder = async (orderId) => {
        setCancellingOrderId(orderId);
        const success = await cancelOrder(orderId);
        setCancellingOrderId(null);
    };


    const handleSubmitReturn = async () => {
        if (!returnData.returnType) {
            showNotification('Please select a return type', 'error');
            return;
        }
        try {
            setReturnData(prev => ({ ...prev, isSubmitting: true }));
            // Prepare data for backend
            const returnRequest = {
                orderId: returnData.orderId,
                productId: returnData.productId,
                reason: returnData.reason === "Other reason"
                    ? returnData.otherReason
                    : returnData.reason,
                returnType: returnData.returnType,
                quantity: returnData.quantity,
                status: "return_requested",
            };
            const success = await submitReturnRequest(returnRequest);
            if (success) {
                // Reset after submission
                setReturnData({
                    orderId: null,
                    productId: null,
                    reason: '',
                    otherReason: '',
                    returnType: '',
                    quantity: '',
                    isSubmitting: false
                });
                setActiveReturnReasons(null);

            } else {
                setReturnData(prev => ({ ...prev, isSubmitting: false }));
            }
        } catch (error) {
            console.error("Return submission failed:", error);
            setReturnData(prev => ({ ...prev, isSubmitting: false }));
        }
    };
    // Helper function to check if a product has a return request
    const getReturnStatus = (productId, orderId) => {
        if (!allReturns || !Array.isArray(allReturns)) {
            return null;
        }
        const returnRecord = allReturns.find(r => r.productid === productId && r.orderid === orderId);
        return returnRecord ? returnRecord.status : null;
    };

    const isWithinReturnWindow = (order) => {
        if (!order || !order.deliveredAt || order.status.toLowerCase() !== "delivered") {
            return false;
        }

        const deliveredDate = new Date(order.deliveredAt);
        const currentDate = new Date();

        const diffTime = currentDate - deliveredDate; // time difference in milliseconds
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // convert milliseconds to minutes
        return diffDays <= 3;
    };

    return (
        <section className="order-section">
            <h2 className="order-title">All Orders</h2>
            <div className="order-container">
                {allOrder?.length > 0 ? (
                    allOrder.slice().reverse().map((order, orderIndex) => (
                        <div className="order-card" key={order._id || orderIndex}>
                            {order.items.map((product, productIndex) => (
                                <div className="order-item" key={product.id || productIndex}>
                                    <div className="product-img-container">
                                        <img src={product.defaultImg} alt={product.name || "Product"} className="product-img" />
                                    </div>
                                    <div className="product-details">
                                        <h3 className="product-name">{product.name || "Unknown Product"}</h3>
                                        <p className="product-meta">
                                            <span className="product-color">Color: {product.selections?.color || "N/A"}</span> |
                                            <span className="product-size"> Size: {product.quantity || "N/A"}</span>
                                        </p>
                                        <p className="product-price"> <small className="currency-label">AED</small>{product.price || 0}</p>

                                        {/* Return Section */}
                                        {/* Return button - only show if within return window */}
                                        {order.status.toLowerCase() === "delivered" && isWithinReturnWindow(order) && (

                                            <div className='return-section' key={product._id}>
                                                <div
                                                    className={`return-btn ${getReturnStatus(product._id, order._id) ? 'disabled' : ''}`}
                                                    onClick={() => toggleReturnDropdown(product._id, order._id)}
                                                >
                                                    {(() => {
                                                        const resolvedReturnStatus = getReturnStatus(product._id, order._id);
                                                        if (resolvedReturnStatus) {
                                                            return resolvedReturnStatus;
                                                        } else if (returnData.isSubmitting && returnData.productId === product._id) {
                                                            return "Submitting...";
                                                        } else {
                                                            return "Return";
                                                        }
                                                    })()}
                                                </div>
                                                {activeReturnReasons === `${product._id}-${order._id}` && (
                                                    <div className="return-dropdown" >
                                                        {returnReasons.map((reason, index) => (
                                                            <div className="return-reason" key={index}
                                                                onClick={() => handleReasonSelect(reason, product._id)}
                                                            >
                                                                {reason}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {returnData.orderId === order._id && returnData.productId === product._id && returnData.reason && (
                                                    <div className="other-reason-container">
                                                        {returnData.reason === "Other reason" && (
                                                            <input
                                                                type="text"
                                                                placeholder="Please specify your reason"
                                                                value={returnData.otherReason}
                                                                onChange={handleOtherReasonChange}
                                                                className="other-reason-input"
                                                            />
                                                        )}

                                                        <div className="return-type-section">
                                                            <label>Select Return Type:</label>
                                                            <select
                                                                value={returnData.returnType}
                                                                onChange={handleReturnTypeChange}
                                                                className="return-type-dropdown"
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="replacement">Replacement</option>
                                                                <option value="save_to_wallet">Save to Wallet</option>
                                                            </select>
                                                        </div>


                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {(returnData.orderId === order._id && returnData.productId === product._id && returnData.reason) && (
                                            <div className="selected-reason">
                                                <p>Selected: {returnData.reason === "Other reason" ? returnData.otherReason : returnData.reason}</p>
                                                <button
                                                    onClick={handleSubmitReturn}
                                                    disabled={returnData.isSubmitting}
                                                    className="submit-reason-btn"
                                                >
                                                    {returnData.isSubmitting ? 'Submitting...' : 'Confirm Return'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Order Summary */}
                            <div className="order-summary">
                                <p>Order ID: {order.orderid}</p>
                                <p>Total Price: <small className="currency-label">AED</small>{order.totalprice}</p>
                                {order.paymentMethod === "wallet" && order.amountPaidFromWallet > 0 && (
                                    <p className="wallet-payment">Amount Paid from Wallet: <small className="currency-label">AED</small>{order.amountPaidFromWallet}</p>
                                )}
                                {order.paymentMethod === "wallet_partial" && order.totalprice > order.amountPaidFromWallet && (
                                    <p className="remaining-payment">Remaining Amount to Pay: <small className="currency-label">AED</small>{(order.totalprice - order.amountPaidFromWallet).toFixed(2)}</p>
                                )}
                                {order.paymentMethod === "COD" && (
                                    <p>Payment Method: Cash on Delivery</p>

                                )}
                                <p>Payment Method: {order.paymentMethod}</p>
                                <p>Order Status: {order.status}</p>
                            </div>

                            {/* Simple Order Tracker */}
                            <div className="order-tracker">
                                <div className="tracker-steps">
                                    <div className={`step ${order.status.toLowerCase() === "placed" ? "active" : ""}`}>
                                        <span className="circle">✔</span>
                                        <p className="step-label">Order Placed</p>
                                        <p className="step-action">Processing</p>
                                    </div>
                                    <div className={`step ${order.status.toLowerCase() === "shipped" ? "active" : ""}`}>
                                        <span className="circle">🚚</span>
                                        <p className="step-label">Shipped</p>
                                        <p className="step-action">On the way</p>
                                    </div>
                                    <div className={`step ${order.status.toLowerCase() === "delivered" ? "active" : ""}`}>
                                        <span className="circle">🏠</span>
                                        <p className="step-label">Delivered</p>
                                        <p className="step-action">Arrived</p>
                                    </div>
                                </div>
                                <div className="tracker-bar">
                                    <div className={`progress ${order.status.toLowerCase()}`}></div>
                                </div>
                            </div>

                            {/* cancel Section */}
                            {/*cancel order button */}
                            {order.status.toLowerCase() !== "delivered" && (
                                <div className='cancel-section'>
                                    {order.status.toLowerCase() === "cancelled" ? (
                                        <span className="cancelled-label">Order Cancelled</span>
                                    ) : (
                                        <div className="cancel-btn"
                                            onClick={() => handleCancelOrder(order._id)}
                                            style={{ pointerEvents: cancellingOrderId === order._id ? 'none' : 'auto', opacity: cancellingOrderId === order._id ? 0.5 : 1 }}

                                        >
                                            {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="no-orders">No orders found.</p>
                )}
            </div>
        </section >
    );
}

export default OrderDetails;
