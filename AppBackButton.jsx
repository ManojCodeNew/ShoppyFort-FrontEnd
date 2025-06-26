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
                position: 'absolute',
                top: '100px',
                left: '10px',
                width: '36px',
                height: '36px',
                zIndex:1,
                borderRadius: '8%',
                backgroundColor: '#fff',
                border: '2px solid #ccc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#000',
                cursor: 'pointer',
            }}

            onClick={() => navigate(-1)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="15 18 9 12 15 6" />
            </svg>
            ←
        </button >
    );
};

export default AppBackButton;
