import React, { useState, useEffect } from 'react';
import ForgotPassword from './ForgotPassword.jsx';
import OtpVerification from './OtpVerification.jsx';
import ResetPassword from './ResetPassword.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function PasswordResetFlow() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const { isAuthenticated, userDataLoaded, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && userDataLoaded) {
            navigate('/profile', { replace: true });
        }
    }, [isAuthenticated, userDataLoaded, navigate]);

    console.log("🔍 [PasswordResetFlow] Page Loaded:", window.location.pathname);
    console.log("🔍 [PasswordResetFlow] Auth state =>", { isAuthenticated, userDataLoaded, isLoading });

    // Early return after all hooks have been called
    if (!userDataLoaded) {
        return <div className="auth-page"><div className="auth-container">Loading...</div></div>;
    }

    return (
        <div>
            {step === 1 && <ForgotPassword onOtpSent={e => { setEmail(e); setStep(2); }} />}
            {step === 2 && <OtpVerification email={email} setOtpCode={setCode} onVerified={() => setStep(3)} />}
            {step === 3 && <ResetPassword email={email} code={code} onReset={() => navigate('/login')} />}
        </div>
    );
}