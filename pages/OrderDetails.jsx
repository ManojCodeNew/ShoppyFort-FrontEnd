import React, { useState } from 'react';
import '../styles/pages/OrderDetails.scss';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';

function OrderDetails() {
    const [orderStatus, setOrderStatus] = useState("placed");
    const overAllPrice = 0;
    const { allOrder, user } = useOrderDetails();
    console.log(allOrder);

    const getProgressBarWidth = (status) => {
        if (status === 'shipped') return '66%';
        if (status === 'delivered') return '100%';
        return '33%';
    };

    return (
        <section className="gradient-custom">
            <div className="orderDisplay-container">
                <div className="center-content row">
                    <div className="col-10">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="text-muted">
                                    Thanks for your Order, <span className="highlight">{user.fullname}</span>!
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="receipt-header">
                                    <p className="receipt-title lead">All orders</p>
                                </div>

                                {allOrder && allOrder.length > 0 ? (
                                    allOrder.slice().reverse().map((order, orderIndex) => {
                                        const progressBarWidth = getProgressBarWidth(order.status || orderStatus);
                                        return (
                                            <div className="orderDisplay-product-card" key={orderIndex}>
                                                {order.items.map((product, productIndex) => {
                                                    return (

                                                        <div className="product-row" key={productIndex}>

                                                            <div className="product-img-container">
                                                                <img
                                                                // product.colorImages[product.selections.color] 
                                                                src={product.defaultImg}
                                                                    alt={product.name || "Product Image"}
                                                                    className="product-img"
                                                                />
                                                            </div>
                                                            <div className="product-info">
                                                                <p className="product-name">{product.name || "Unknown Product"}</p>
                                                                <div className="product-price-details">
                                                                    <span className="product-price">₹{product.price || 0}</span>
                                                                </div>
                                                                <p className="product-meta">
                                                                    Color: <span className="meta-value">{product.selections.color || "N/A"}</span>
                                                                    &nbsp; Size: <span className="meta-value">{product.quantity || "N/A"}</span>
                                                                </p>
                                                            </div>

                                                        </div>
                                                    )
                                                })}
                                                <hr />
                                                <div className="tracker-container">
                                                    <div
                                                        className="progress-bar-container"
                                                        style={{ width: progressBarWidth }}
                                                    ></div>
                                                    <ul className="progressbar-container">
                                                        <li
                                                            className={order.status === "placed" ? "active step" : "step"}
                                                            id="step1"
                                                        >
                                                            <span>PLACED</span>
                                                        </li>
                                                        <li
                                                            className={
                                                                order.status === "shipped" || order.status === "delivered"
                                                                    ? "active step"
                                                                    : "step"
                                                            }
                                                            id="step2"
                                                        >
                                                            <span>SHIPPED</span>
                                                        </li>
                                                        <li
                                                            className={order.status === "delivered" ? "active step" : "step"}
                                                            id="step3"
                                                        >
                                                            <span>DELIVERED</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                {/* <div className="btn-container">
                                                <button class="btn ripple">Cancel</button>
                                                </div> */}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No orders found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OrderDetails;
