import React, { useState } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import sendPostRequestToBackend from '@/components/Request/Post';

export default function ResetPassword({ email, code, onReset }) {
    const [password, setPassword] = useState('');
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = await sendPostRequestToBackend("auth/reset-password",{ email, code, password });
        setLoading(false);
        if (data.success) {
            showNotification('Password reset successful!', 'success');
            onReset();
        } else {
            showNotification(data.error || 'Error resetting password', 'error');
        }
    };

    return (
        <div className="reset-step">
            <form onSubmit={handleReset}>
                <h2>Set New Password</h2>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter new password" 
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}