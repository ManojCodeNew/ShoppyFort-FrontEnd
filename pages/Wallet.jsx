import React, { useEffect, useState } from 'react';
import '../styles/pages/Wallet.scss';
import { useWallet } from '@/contexts/WalletContext.jsx';
import walletIcon from '../assets/Images/wallet.png';
import { FiArrowUpRight, FiArrowDownLeft, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

export default function Wallet() {
    const { getWallet, wallet } = useWallet();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getWallet(); // fetch once
    }, [getWallet]);

    useEffect(() => {
        if (wallet !== null) {
            setBalance(wallet.balance);
            setTransactions(wallet.transactions || [])
        }
        setLoading(false);
    }, [wallet]);


    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
    };
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
                                {loading ? 'Loading...' : `${balance?.toFixed(2) || '0.00'}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="transaction-section">
                <div className="transaction-header">
                    <h2>Recent Transactions</h2>
                    <span className="count">{transactions.length} total</span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <FiClock />
                        <p>Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <FiClock />
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="transactions-list">
                        {transactions.slice(0, 10).map((txn, index) => (
                            <div key={index} className={`transaction-item ${txn.type}`}>
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
                                            <span className="description">{txn.note}</span>
                                            <span className="date">{formatDate(txn.date)}</span>
                                            {txn.orderid && <span className="order-id">Order: {txn.orderid}</span>}
                                        </div>
                                        <div className="transaction-amount">
                                            <span className={`amount ${txn.type}`}>
                                                {txn.type === 'credit' ? '+' : '-'} <span className='aed-text'>AED </span> {txn.amount.toFixed(2)}
                                            </span>
                                            {txn.type === 'debit' && txn.remainingAmount && (
                                                <span className="remaining-amount">
                                                    (Remaining: ₹{txn.remainingAmount.toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))};
                    </div>
                )
                }
            </div>
        </>
    )
};
