import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/auth/auth.scss';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin, error, isLoading, isAuthenticated, userDataLoaded } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/profile';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && userDataLoaded) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, userDataLoaded, navigate, from]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    if (!email.trim() || !password.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        console.log('Login successful, navigation will be handled by useEffect');
        // navigate(from, { replace: true });

      } else {
        console.log('Login failed:', result.error);
      }
    } catch (err) {
      console.error('Login submission error:', err);
      showNotification('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      showNotification('Google login failed - no credential received', 'error');
      return;
    }
    console.log('Google login credential received:', credentialResponse);


    try {
      setIsSubmitting(true);
      const result = await googleLogin(credentialResponse.credential);

      if (result.success) {
        console.log('Google login successful, user will be redirected to:', from);
        // navigate(from, { replace: true });
      } else {
        console.log('Google login failed:', result.error);
      }
    } catch (err) {
      console.error('Google login error:', err);
      showNotification('Google login error occurred', 'error');
    }finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginError = () => {
    showNotification('Google login failed!', 'error');
  };
  console.log('Current origin:', window.location.origin);
  console.log('Current pathname:', window.location.pathname);
  const isFormDisabled = isLoading || isSubmitting;

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
              disabled={isFormDisabled}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isFormDisabled}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isFormDisabled || !email.trim() || !password.trim()}
          >
            {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='or-divider'></p>

        <div className="loginwithgoogle">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleLoginError}
            auto_select={false}
            theme="outline"
            size="large"
            text="signin_with"
          />
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;