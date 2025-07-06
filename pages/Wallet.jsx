import React, { useEffect, useState, useMemo } from 'react';
import '../styles/pages/Wallet.scss';
import { useWallet } from '@/contexts/WalletContext.jsx';
import walletIcon from '../assets/Images/wallet.png';
import { FiArrowUpRight, FiArrowDownLeft, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { useProducts } from '@/contexts/ProductsContext';
import { useOrderDetails } from '@/contexts/OrderDetailsContext';

export default function Wallet() {
    const { getWallet, wallet, loading, initialized, refreshWallet } = useWallet();
    const [localLoading, setLocalLoading] = useState(true);
    const { allOrder, fetchOrders } = useOrderDetails();
    const { products, fetchProducts } = useProducts();

    console.log("Wallet component initialized with wallet:", wallet);

    // Initialize data only once
    useEffect(() => {
        const initializeData = async () => {
            try {
                setLocalLoading(true);

                // Fetch products and orders in parallel, but only if not already loaded
                const promises = [];

                if (!products || products.length === 0) {
                    promises.push(fetchProducts());
                }

                if (!allOrder || allOrder.length === 0) {
                    promises.push(fetchOrders());
                }

                // Always fetch wallet data when the wallet page is accessed
                promises.push(getWallet());


                await Promise.allSettled(promises);


            } catch (error) {
                console.error("Error initializing wallet data:", error);
            } finally {
                setLocalLoading(false);
            }
        };

        initializeData();
    }, []); // Empty dependency array - only run once on mount



    // Memoized helper functions to prevent unnecessary re-renders
    const getOrderDetails = useMemo(() => {
        return (orderid) => {
            if (!allOrder || !orderid) return null;
            const id = orderid?.toString?.() || orderid;
            return allOrder.find(order => order.orderid === id);

        };
    }, [allOrder]);

    const getProductDetails = useMemo(() => {
        return (productObj) => {
            if (!productObj || !productObj._id || !products) return 'N/A';
            const matchedItem = products.find(item => item._id === productObj._id);
            return matchedItem?.productid || 'N/A';
        };
    }, [products]);

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
        } catch (error) {
            console.error("Date formatting error:", error);
            return 'Invalid date';
        }
    };

    // Memoized transactions to prevent unnecessary processing
    const processedTransactions = useMemo(() => {
        if (!wallet?.transactions) return [];

        return wallet.transactions
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    }, [wallet?.transactions]);
    console.log("Processed Transactions:", processedTransactions);

    const isLoading = loading || localLoading;
    const balance = wallet?.balance || 0;
    const transactionCount = wallet?.transactions?.length || 0;
    return (
        <>
            <div className="wallet-page">
                <h2 className="wallet-title">My Wallet</h2>
                <div className="wallet-card">
                    <div className="wallet-info">
                        <div className="wallet-icon">
                            <img src={walletIcon} alt="wallet" />
                        </div>
                        <div className="wallet-text">
                            <span className="label">Wallet Balance  </span>
                            <span className="balance">
                                <span className='aed-text'>AED </span>
                                {isLoading ? 'Loading...' : balance?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="transaction-section">
                <div className="transaction-header">
                    <h2>Recent Transactions</h2>
                    <span className="count">{transactionCount} total</span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <FiClock />
                        <p>Loading transactions...</p>
                    </div>
                ) : transactionCount === 0 ? (
                    <div className="empty-state">
                        <FiClock />
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="transactions-list">
                        {processedTransactions.map((txn, index) => (
                            <div key={txn._id || index} className={`transaction-item ${txn.type}`}>
                                <div className="transaction-icon">
                                    {txn.type === 'credit' ? (
                                        <FiArrowDownLeft className="credit" />
                                    ) : (
                                        <FiArrowUpRight className="debit" />
                                    )}
                                </div>
                                <div className="transaction-main">
                                    <div className="transaction-details">
                                        <div className="transaction-info">
                                            <span className="description">
                                                {txn.note || `${txn.type === 'credit' ? 'Credit' : 'Payment'} transaction`}
                                            </span>
                                            <span className="date">{formatDate(txn.date)}</span>
                                            {txn.orderid && txn.type === "debit" && (
                                                <span className="order-id">
                                                    Order Id: {getOrderDetails(txn.orderid)?.orderid || 'N/A'}
                                                </span>
                                            )}

                                            {/* {txn.orderid && txn.type === 'credit' && (
                                                <span className="order-id">
                                                    Order Id: {getOrderDetails(txn.orderid)?.orderid || txn.orderid}
                                                </span>
                                            )} */}
                                            {txn.productid && (
                                                <span className="order-id">
                                                    Product Id: {getProductDetails(txn.productid)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="transaction-amount">
                                            <span className={`amount ${txn.type}`}>
                                                {txn.type === 'credit' ? '+' : '-'}
                                                <span className='aed-text'>AED </span>
                                                {(txn.amount || 0).toFixed(2)}
                                            </span>
                                            {txn.type === 'debit' && txn.remainingAmount && txn.remainingAmount > 0 && (
                                                <span className="remaining-amount">
                                                    (Remaining: AED {txn.remainingAmount.toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }
            </div>
        </>
    )
};
