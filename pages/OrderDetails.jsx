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
            <div className="container">
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
                                    allOrder.map((order, orderIndex) => {
                                        const progressBarWidth = getProgressBarWidth(order.status || orderStatus);
                                        return (
                                            <div className="product-card" key={orderIndex}>
                                                {order.items.map((product, productIndex) => {
                                                    console.log("data",product);
                                                    
                                                    // overAllPrice += product.price * product.quantity;
                                                    return (

                                                        <div className="product-row" key={productIndex}>

                                                            <div className="product-img-container">
                                                                <img
                                                                    src={product.image || "default-image-url.webp"}
                                                                    alt={product.name || "Product Image"}
                                                                    className="product-img"
                                                                />
                                                            </div>
                                                            <div className="product-info">
                                                                <p className="product-name">{product.name || "Unknown Product"}</p>
                                                                <p className="product-details"><b>Brand: </b>{product.brand || "N/A"}</p>
                                                                <p className="product-details"><b>Qty: </b>{product.quantity || 0}</p>
                                                                <p className="product-price"><b>Price :</b> ₹{product.price || 0}</p>
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
