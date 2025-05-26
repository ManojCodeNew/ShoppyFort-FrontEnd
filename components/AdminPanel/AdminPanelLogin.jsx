import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import './styles/AdminPanelLogin.css';
import sendPostRequestToBackend from '../Request/Post.jsx';

const AdminPanelLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!credentials.username.trim() || !credentials.password.trim()) {
            setError('Please enter both username and password.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await sendPostRequestToBackend('admin/login', credentials);
            if (response.success) {
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminToken', response.token);

                navigate('/admin');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error("Login Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-header">
                    <LogIn className="login-icon" />
                    <h1>Admin Login</h1>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminPanelLogin;