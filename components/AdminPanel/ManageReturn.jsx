import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Collapse,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useManageReturnContext } from "./Context/ManageReturn.jsx";
import Loader from "../Load/Loader.jsx";

const ManageReturn = () => {
    const { returns, fetchReturns, updateStatus, deleteReturn } = useManageReturnContext();
    const [loading, setLoading] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return; // Prevent double fetch
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
console.log("returns :", returns);
    const handleAccept = useCallback((id) => updateStatus(id, "approved"), [updateStatus]);
    const handleReject = useCallback((id) => updateStatus(id, "rejected"), [updateStatus]);
    const handleProcessed = useCallback((id) => updateStatus(id, "processed"), [updateStatus]);
    const handleDelete = useCallback((id) => deleteReturn(id), [deleteReturn]);

    const renderActions = (returnItem) => {
        switch (returnItem.status) {
            case "Return Requested":
                return (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAccept(returnItem._id)}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleReject(returnItem._id)}
                            sx={{ ml: 1 }}
                        >
                            Reject
                        </Button>
                    </>
                );
            case "approved":
                return (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleProcessed(returnItem._id)}
                    >
                        Processed
                    </Button>
                );
            case "rejected":
                return (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(returnItem._id)}
                    >
                        Delete
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Manage Returns
            </Typography>
            {loading ? (
                <Loader />
            ) : returns.length === 0 ? (
                <Typography>No return requests found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Order ID</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Return Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {returns.map((returnItem) => (
                                <ReturnRow
                                    key={returnItem._id}
                                    returnItem={returnItem}
                                    renderActions={renderActions}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

const ReturnRow = ({ returnItem, renderActions }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{returnItem.orderid}</TableCell>
                <TableCell>{returnItem.userDetails?.name || "Unknown User"}</TableCell>
                <TableCell>{returnItem.reason}</TableCell>
                <TableCell>
                    {new Date(returnItem.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{returnItem.status}</TableCell>
                <TableCell>{renderActions(returnItem)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={2}>
                            <Typography variant="h6" gutterBottom component="div">
                                Product Details
                            </Typography>
                            <Table size="small" aria-label="product details">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            {returnItem.productDetails?.name || "Unknown Product"}
                                        </TableCell>
                                        <TableCell>
                                            {returnItem.productDetails?.sku || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {returnItem.productDetails?.quantity || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            ₹{returnItem.productDetails?.price || "N/A"}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default ManageReturn;