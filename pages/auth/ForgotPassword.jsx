import React, { useState } from "react";
import { useNotification } from "@/components/Notify/NotificationProvider";
import sendPostRequestToBackend from "@/components/Request/Post";

export default function ForgotPassword({ onOtpSent }) {
    const [email, setEmail] = useState('');
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = await sendPostRequestToBackend("auth/send-otp", { email });
        setLoading(false);
        if (data.success) {
            showNotification('OTP sent to your email', 'success');
            onOtpSent(email);
        } else {
            showNotification(data.error || 'Error sending OTP', 'error');
        }
    };

    return (
        <form onSubmit={handleSendOtp}>
            <h2>Forgot Password</h2>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" />
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
    );
}
