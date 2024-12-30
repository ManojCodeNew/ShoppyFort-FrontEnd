import React, { useState } from "react";
import './styles/ManageOrder.css';
const orders = [
    {
        orderId: "#6010",
        customer: {
            name: "Jayvion Simon",
            email: "nannie.abernathy70@yahoo.com",
        },
        date: "28 Dec 2024",
        time: "9:54 PM",
        items: 6,
        totalPrice: "$484.15",
        status: "Refunded",
        products: [
            { name: "Urban Explorer Sneakers", sku: "16H9UR0", qty: 1, price: "$83.74" },
            { name: "Classic Leather Loafers", sku: "16H9UR1", qty: 2, price: "$97.14" },
        ],
    },
    {
        orderId: "#6011",
        customer: {
            name: "Lucian Obrien",
            email: "ashlynn.ohara62@gmail.com",
        },
        date: "27 Dec 2024",
        time: "8:54 PM",
        items: 1,
        totalPrice: "$83.74",
        status: "Completed",
        products: [],
    },
];

const ManageOrder = () => {
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (orderId) => {
        setExpandedRows((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <React.Fragment key={order.orderId}>
                            <tr>
                                <td>{order.orderId}</td>
                                <td>
                                    {order.customer.name}
                                    <br />
                                    <span className="email">{order.customer.email}</span>
                                </td>
                                <td>
                                    {order.date}
                                    <br />
                                    <span className="time">{order.time}</span>
                                </td>
                                <td>{order.items}</td>
                                <td>{order.totalPrice}</td>
                                <td>
                                    <span className={`status ${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleRow(order.orderId)}
                                    >
                                        {expandedRows[order.orderId] ? "Hide" : "Show"}
                                    </button>
                                </td>
                            </tr>
                            {expandedRows[order.orderId] && (
                                <tr className="expanded-row">
                                    <td colSpan="7">
                                        <ul>
                                            {order.products.map((product) => (
                                                <li key={product.sku}>
                                                    {product.name} (SKU: {product.sku}, Qty: {product.qty},
                                                    Price: {product.price})
                                                </li>
                                            ))}
                                        </ul>
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
