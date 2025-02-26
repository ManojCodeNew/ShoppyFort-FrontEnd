import React, { useState, useEffect } from "react";
import { useOrderContext } from "./Context/ManageOrderContext.jsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./styles/ManageOrder.css";

const ManageOrder = () => {
    const [orders, setOrders] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const { ordersData } = useOrderContext();

    useEffect(() => {
        const reversedData=ordersData.reverse();
        console.log(reversedData);
        
        setOrders(reversedData);
    }, [ordersData]);

    const toggleRow = (orderId) => {
        setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const updateStatus = (orderId, newStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderid === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    return (
        <div className="table-container">
            <h2 className="table-title">Manage Orders</h2>
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
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <React.Fragment key={order.orderid}>
                            <tr>
                                <td>{order.orderid}</td>
                                <td>
                                    <strong>{order.shippingaddress?.username || "Unknown"}</strong>
                                    <br />
                                    <span className="contact">{order.shippingaddress?.mobileno || "No Contact"}</span>
                                </td>
                                <td>
                                    {order.shippingaddress?.deliveryaddress}, {order.shippingaddress?.locality}, {order.shippingaddress?.city}
                                    <br />
                                    <span className="state">{order.shippingaddress?.state} - {order.shippingaddress?.pincode}</span>
                                </td>
                                <td>{order.items.length}</td>
                                <td>₹{order.totalprice}</td>
                                <td>{order.createdAt?new Date(order.createdAt).toLocaleString():"N/A"}</td>
                                <td>
                                    {order.status === "Delivered" || order.status === "Refunded" ? (
                                        <span className={`status ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    ) : (
                                        <>
                                            <button className="action-btn shipped">Shipped</button>
                                            <button
                                                className="action-btn delivered"
                                                onClick={() => updateStatus(order.orderid, "Completed")}
                                            >
                                                Delivered
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleRow(order.orderid)}
                                    >
                                        {expandedRows[order.orderid] ? "Hide" : "Show"}
                                        {expandedRows[order.orderid] ? <ChevronUp /> : <ChevronDown />}
                                    </button>
                                </td>
                            </tr>
                            {expandedRows[order.orderid] && (
                                <tr className="expanded-row">
                                    <td colSpan="7">
                                        <h4>Product Details</h4>
                                        <table className="product-table">
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
        </div>
    );
};

export default ManageOrder;
