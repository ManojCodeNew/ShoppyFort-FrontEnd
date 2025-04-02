import React, { useState } from 'react';
import '../styles/pages/OrderDetails.scss';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';

function OrderDetails() {
    const { allOrder } = useOrderDetails();
    const [activeReturnReasons, setActiveReturnReasons] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const returnReasons = [
        "Wrong size ordered",
        "Product damaged",
        "Not as described",
        "Changed my mind",
        "other"
    ];

    const toggleReturnDropdown = (orderId) => {
        setActiveReturnReasons(activeReturnReasons === orderId ? null : orderId);
        setSelectedReason(null);
    }
    return (
        <section className="order-section">
            <h2 className="order-title">All Orders</h2>
            <div className="order-container">
                {allOrder?.length > 0 ? (
                    allOrder.slice().reverse().map((order, orderIndex) => (
                        <div className="order-card" key={order.id || orderIndex}>
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
                                        <p className="product-price">₹{product.price || 0}</p>
                                    </div>
                                </div>
                            ))}

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

                            {/* Return Section */}
                            {/*Return button */}
                            {order.status.toLowerCase() === "delivered" && (
                                <div className='return-section'>
                                    <div
                                        className="return-btn"
                                        onClick={() => toggleReturnDropdown(order._id)}
                                    >
                                        Return
                                    </div>
                                    {activeReturnReasons === order._id && (
                                        <div className="return-dropdown" >
                                            {returnReasons.map((reason, index) => (
                                                <div className="return-reason" key={index} onClick={() => {
                                                    setSelectedReason(reason);
                                                    setActiveReturnReasons(null);
                                                }}>
                                                    {reason}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedReason === "other" && (
                                        <div className="other-reason">
                                            <input type="text" id="other-reason-input" />
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* cancel Section */}
                            {/*cancel order button */}
                            {order.status.toLowerCase() != "delivered" && (
                                <div className='cancel-section'>
                                    <div className="cancel-btn">
                                        cancel
                                    </div>
                                </div>
                            )}

                        </div>



                    ))
                ) : (
                    <p className="no-orders">No orders found.</p>
                )}
            </div>
        </section>
    );
}

export default OrderDetails;
