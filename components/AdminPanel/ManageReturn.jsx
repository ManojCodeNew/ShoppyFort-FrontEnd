import React, { useState, useEffect, useRef, useCallback } from "react";
import { useManageReturnContext } from "./Context/ManageReturn.jsx";
import Loader from "../Load/Loader.jsx";
import './styles/ManageReturn.css';
const ManageReturn = () => {
    const { returns, fetchReturns, updateStatus, deleteReturn } = useManageReturnContext();
    const [loading, setLoading] = useState(false);
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
    }, [fetchReturns]);

    const handleAccept = useCallback((id) => updateStatus(id, "approved"), [updateStatus]);
    const handleReject = useCallback((id) => updateStatus(id, "rejected"), [updateStatus]);
    const handleProcessed = useCallback((id) => updateStatus(id, "processed"), [updateStatus]);
    const handleDelete = useCallback((id) => deleteReturn(id), [deleteReturn]);

    const renderActions = (item) => {
        switch (item.status) {
            case "Return Requested":
                return (
                    <>
                        <button className="btn primary" onClick={() => handleAccept(item._id)}>Accept</button>
                        <button className="btn secondary" onClick={() => handleReject(item._id)}>Reject</button>
                    </>
                );
            case "approved":
                return <button className="btn success" onClick={() => handleProcessed(item._id)}>Processed</button>;
            case "rejected":
                return <button className="btn danger" onClick={() => handleDelete(item._id)}>Delete</button>;
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
                            <th>Return Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...returns].reverse().map((item, index) => (
                            <React.Fragment key={item._id}>
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.orderid}</td>
                                    <td>{item.userDetails?.name || "Unknown"}</td>
                                    <td>{item.reason}</td>
                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                    <td>{item.status}</td>
                                    <td>{renderActions(item)}</td>
                                </tr>
                                <tr className="product-details-row">
                                    <td colSpan="7">
                                        <div className="product-details">
                                            <strong>Product:</strong> {item.productDetails?.name || "Unknown"} |
                                            <strong> SKU:</strong> {item.productDetails?.sku || "N/A"} |
                                            <strong> Quantity:</strong> {item.productDetails?.quantity || "N/A"} |
                                            <strong> Price:</strong> ₹{item.productDetails?.price || "N/A"}
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageReturn;
