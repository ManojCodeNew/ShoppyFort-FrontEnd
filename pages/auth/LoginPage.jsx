import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/auth/auth.scss';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { GoogleLogin } from '@react-oauth/google';
import sendGetRequestToBackend from '@/components/Request/Get';
import sendPostRequestToBackend from '@/components/Request/Post';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading, user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate])

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

  const handleGoogleLogin = async (token) => {
    try {
      const response = await sendPostRequestToBackend('auth/google-login', { token });
      if (response.success) {
        localStorage.setItem('token', response.token);
        const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);
        if (!accessUserData.er) {
          setUser(accessUserData?.user);
          showNotification('Google login successful! 🎉', 'success');
          navigate('/profile');
        }
      } else {
        showNotification('Google login failed!', 'error');
      }
    } catch (err) {
      showNotification('Google login error', 'error');
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
        <p className='or-divider'>OR</p>
        <div className="loginwithgoogle">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              // Send credentialResponse.credential (JWT) to your backend
              console.log(credentialResponse);
              handleGoogleLogin(credentialResponse.credential);
              // navigate('/profile');
            }}
            onError={() => {
              showNotification('Google login failed!', 'error');
            }} />
        </div>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;