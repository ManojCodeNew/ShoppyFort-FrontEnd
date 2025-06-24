import React from 'react';
import { useNavigate } from 'react-router-dom';

const AppBackButton = () => {
    const navigate = useNavigate();

    // Detect if inside WebView
    const isInWebView =
        navigator.userAgent.includes('wv') || navigator.userAgent.includes('WebView');

    if (!isInWebView) return null;

    return (
        <button
            style={{
                margin: '12px 0',
                padding: '10px 18px',
                backgroundColor: 'gray',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
            }}
            onClick={() => navigate(-1)}
        >
            ⬅ Back
        </button>
    );
};

export default AppBackButton;
