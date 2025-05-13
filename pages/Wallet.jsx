import React, { useEffect, useState } from 'react';
import '../styles/pages/Wallet.scss';
import { useUserNotifications } from '@/contexts/UserNotificationContext.jsx';
import walletIcon from '../assets/Images/wallet.png';
export default function Wallet() {
    const { getWallet } = useUserNotifications();
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await getWallet();
                
                if (response.success) {
                    console.log("Succes of Wallet :", response);

                    setBalance(response.balance); // Make sure API returns balance here
                } else {
                    console.error('Error fetching wallet:', response.message || response.error);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [getWallet]);

    return (
        <div className="wallet-page">
            <h2 className="wallet-title">My Wallet</h2>
            <div className="wallet-card">
                <div className="wallet-info">
                    <div className="wallet-icon"><img src={walletIcon} alt="wallet" /></div>
                    <div className="wallet-text">
                        <span className="label">Wallet Balance  </span>
                        <span className="balance">
                            {loading ? 'Loading...' : `₹ ${balance?.toFixed(2) || '0.00'}`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
