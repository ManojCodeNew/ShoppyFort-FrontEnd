import React, { useState } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import sendPostRequestToBackend from '@/components/Request/Post';

export default function OtpVerification({ email, onVerified, setOtpCode }) {
    const [code, setCode] = useState('');
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = await sendPostRequestToBackend("auth/verify-otp", { email, code });
        setLoading(false);
        if (data.success) {
            showNotification('OTP verified!', 'success');
            setOtpCode(code);
            onVerified();
        } else {
            showNotification(data.error || 'Invalid OTP', 'error');
        }
    };

    return (
        <div className="reset-step">
            <form onSubmit={handleVerify}>
                <h2>Enter OTP</h2>
                <input 
                    type="text" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    required 
                    placeholder="Enter 6-digit OTP" 
                    maxLength={6}
                    className="otp-input"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>
        </div>
    );
}