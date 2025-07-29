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
  
  // Don't redirect if user is on auth pages (register, forgot-password)
  const isOnAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  useEffect(() => {
    console.log('LoginPage useEffect triggered:', {
      isAuthenticated,
      userDataLoaded,
      from,
      location: location.pathname,
      isOnAuthPage
    });
    if (isAuthenticated && userDataLoaded && !isOnAuthPage) {
      console.log('Conditions met for redirect. Navigating to:', from);

      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        console.log('Executing navigation to:', from);
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, userDataLoaded, navigate, from, location.pathname, isOnAuthPage]);


  // Redirect if already logged in
  // useEffect(() => {
  //   if (isAuthenticated && userDataLoaded) {
  //     console.log('User is already authenticated, redirecting to:', from);
  //     navigate(from, { replace: true });
  //   }
  // }, [isAuthenticated, userDataLoaded, navigate, from]);

  // Early return if user is already authenticated to prevent rendering login form
  if (isAuthenticated && userDataLoaded && !isOnAuthPage) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

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
        console.log('Login successful', result);
        setTimeout(() => {
          console.log('Executing delayed navigation to:', from);
          navigate(from, { replace: true });
        }, 500);

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

    try {
      setIsSubmitting(true);
      // Add retry logic for production
      let retryCount = 0;
      const maxRetries = 3;
      let result;

      while (retryCount < maxRetries) {
        try {
          result = await googleLogin(credentialResponse.credential);
          break;
        } catch (error) {
          console.error(`Google login attempt ${retryCount + 1} failed:`, error);
          retryCount++;

          if (retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw error; // Max retries reached
          }
        }
      }
      if (result && result.success) {
        setTimeout(() => {
          console.log('Executing delayed Google login navigation to:', from);
          navigate(from, { replace: true });
        }, 500);
        console.log('Google login successful', result);
      } else {
        console.log('Google login failed:', result.error);
        showNotification(result?.error || 'Google login failed', 'error');

      }
    } catch (err) {
      console.error('Google login error:', err);
      showNotification('Google login error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginError = () => {
    showNotification('Google login failed!', 'error');
  };

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
        <p className="auth-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;