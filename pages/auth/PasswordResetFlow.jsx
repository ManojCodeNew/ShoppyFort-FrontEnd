import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword.jsx';
import OtpVerification from './OtpVerification.jsx';
import ResetPassword from './ResetPassword.jsx';
import { useNavigate } from 'react-router-dom';

export default function PasswordResetFlow() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    return (
        <div>
            {step === 1 && <ForgotPassword onOtpSent={e => { setEmail(e); setStep(2); }} />}
            {step === 2 && <OtpVerification email={email} setOtpCode={setCode} onVerified={() => setStep(3)} />}
            {step === 3 && <ResetPassword email={email} code={code} onReset={() => navigate('/login')} />}
        </div>
    );
}