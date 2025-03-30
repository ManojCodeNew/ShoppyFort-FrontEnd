import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/auth/auth.scss';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/profile');
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userLoginResponse = await login(email, password);

    if (userLoginResponse.success) {
      showNotification('Login successful! 🎉', 'success');
      navigate('/profile');
    } else {
      showNotification('Invalid email or password!', 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;