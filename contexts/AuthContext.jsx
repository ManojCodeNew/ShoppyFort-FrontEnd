import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
import sendGetRequestToBackend from '@/components/Request/Get';

const AuthContext = createContext();
const TOKEN_TYPE = "token";

const token = localStorage.getItem(TOKEN_TYPE);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Add 5 minute buffer to prevent edge cases
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  };

  // Helper function to clear auth data
  const clearAuthData = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setUserDataLoaded(true); // Set to true so public routes work immediately
    localStorage.removeItem(TOKEN_TYPE);
    setError(null);
  }, []);

  // Helper function to handle auth errors - DON'T AUTO NAVIGATE
  const handleAuthError = useCallback((error, showToast = true) => {
    console.error('Auth error:', error);

    if (error.includes('TokenExpired') || error.includes('expired')) {
      if (showToast) showNotification('Session expired. Please login again.', 'warning');
      clearAuthData();
      // DON'T auto-navigate here - let components handle it
    } else if (error.includes('Unauthorized') || error.includes('401')) {
      if (showToast) showNotification('Authentication required.', 'info');
      clearAuthData();
      // DON'T auto-navigate here - let components handle it
    } else if (error.includes('Network') || error.includes('fetch')) {
      setNetworkError(true);
      if (showToast) showNotification('Network error. Please check your connection.', 'error');
      // DON'T clear auth data on network errors - keep user logged in
    } else {
      if (showToast) showNotification(error, 'error');
    }
  }, [showNotification, clearAuthData]);

  // Initialize authentication state - FIXED
  useEffect(() => {
    console.log("🔄 [Auth] useEffect triggered...");
    console.log("Token from localStorage:", localStorage.getItem("token"));

    const initializeAuth = async () => {
      console.log("🔄 Initializing Auth...");
      try {
        setNetworkError(false);
        setLoading(true); // Ensure loading is true during initialization
        const storedToken = localStorage.getItem(TOKEN_TYPE);

        console.log("✔ Stored token:", storedToken);

        // If no token, just finish loading - DON'T redirect
        if (!storedToken) {
          console.log("❌ No token found. Marking auth as loaded for public routes.");

          setLoading(false);
          setUserDataLoaded(true);
          setIsAuthenticated(false); // Explicitly set to false
          return;
        }

        // Check if token is expired before making request
        if (isTokenExpired(storedToken)) {
          console.log("❌ Token is expired");

          console.log("Token expired, clearing auth data");
          clearAuthData();
          setLoading(false);
          return; // clearAuthData already sets userDataLoaded = true
        }
        console.log("✅ Valid token found. Attempting to fetch user data...");

        // Add retry logic for network issues
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount < maxRetries) {
          try {
            console.log("Fetching user data with token:", storedToken);
            // Fetch user data with the stored token
            const accessUserData = await sendGetRequestToBackend('auth/getUser', storedToken);

            // Handle various error responses
            if (accessUserData.error || accessUserData.er) {
              const errorMsg = accessUserData.error || accessUserData.er;

              // If it's a network error, retry
              if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
                retryCount++;
                if (retryCount < maxRetries) {
                  console.log(`Network error, retrying... (${retryCount}/${maxRetries})`);
                  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                  continue;
                }
                // After max retries, set network error but keep existing auth
                setNetworkError(true);
                break;
              }

              handleAuthError(errorMsg, false); // Don't show toast on initial load
              break;
            } else if (accessUserData.tokenExpired) {
              handleAuthError('TokenExpired', false);
              break;
            } else if (accessUserData.success && accessUserData.user) {
              setUser(accessUserData.user);
              setIsAuthenticated(true);
              setNetworkError(false);
              break;
            }
          } catch (err) {
            retryCount++;
            if (retryCount >= maxRetries) {
              console.error('Max retries reached:', err);
              setNetworkError(true);
              // Keep existing auth state on network errors
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setNetworkError(true);
        // Don't clear auth data on initialization errors
      } finally {
        setLoading(false);
        setUserDataLoaded(true);

      }
    };

    initializeAuth();
  }, []);

  // Login function - IMPROVED
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      setNetworkError(false);

      const response = await sendPostRequestToBackend('auth/login', { email, password });

      // Handle error responses
      if (!response.success) {
        const errorMsg = response.msg || response.er || response.error;
        setError(errorMsg);
        showNotification(errorMsg, "error");
        return { success: false, error: errorMsg };
      }

      // Check if we got a valid response
      if (!response.token) {
        const errorMsg = response.message || 'Invalid login response - no token received';
        setError(errorMsg);
        showNotification(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      // Store token first
      localStorage.setItem(TOKEN_TYPE, response.token);

      // Then fetch user data
      const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);

      if (accessUserData.error || accessUserData.er) {
        const errorMsg = accessUserData.error || accessUserData.er;
        showNotification(`Failed to get user data: ${errorMsg}`, "error");
        clearAuthData();
        return { success: false, error: errorMsg };
      }

      if (accessUserData.success && accessUserData.user) {
        setUser(accessUserData.user);

        setIsAuthenticated(true);
        setNetworkError(false);
        setUserDataLoaded(true);
        showNotification('Login successful! 🎉', 'success');
        navigate('/profile'); // Redirect to profile after reload
        return { success: true, user: accessUserData.user, token: response.token };
      } else {
        const errorMsg = 'Invalid user data response';
        showNotification(errorMsg, 'error');
        clearAuthData();
        return { success: false, error: errorMsg };
      }

    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      console.error('Login error:', err);
      setError(errorMsg);

      if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        setNetworkError(true);
        showNotification('Network error. Please check your connection.', 'error');
      } else {
        showNotification('Login failed. Please try again.', 'error');
      }

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [showNotification, clearAuthData]);

  // Register function - IMPROVED
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      setNetworkError(false);

      const response = await sendPostRequestToBackend("auth/register", userData);

      // Handle error responses
      if (response.msg || response.message) {
        setError(response.msg || response.message);
        showNotification(response.msg || response.message, "error");
        return { success: false, error: response.msg || response.message };
      }

      if (response.er) {
        setError(response.er);
        showNotification(response.er, "error");
        return { success: false, error: response.er };
      }

      if (response.error) {
        setError(response.error);
        showNotification(response.error, "error");
        return { success: false, error: response.error };
      }

      if (!response.token) {
        const errorMsg = 'Invalid registration response - no token received';
        setError(errorMsg);
        showNotification(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      // Store token first
      localStorage.setItem(TOKEN_TYPE, response.token);

      // Then fetch user data
      const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);

      if (accessUserData.error || accessUserData.er) {
        const errorMsg = accessUserData.error || accessUserData.er;
        showNotification(`Failed to get user data: ${errorMsg}`, "error");
        clearAuthData();
        return { success: false, error: errorMsg };
      }

      if (accessUserData.success && accessUserData.user) {
        setUser(accessUserData.user);
        setIsAuthenticated(true);
        setNetworkError(false);
        setUserDataLoaded(true);
        showNotification("Registration successful! 🎉", "success");
        navigate('/profile'); // ✅ Let React Router handle navigation
        return { success: true, user: accessUserData.user, token: response.token };
      } else {
        const errorMsg = 'Invalid user data response';
        showNotification(errorMsg, 'error');
        clearAuthData();
        return { success: false, error: errorMsg };
      }

    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      console.error('Registration error:', err);
      setError(errorMsg);

      if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        setNetworkError(true);
        showNotification('Network error. Please check your connection.', 'error');
      } else {
        showNotification('Registration failed. Please try again.', 'error');
      }

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [showNotification, clearAuthData]);

  // Logout function - IMPROVED
  const logout = useCallback(() => {
    clearAuthData(); // This now sets userDataLoaded = true
    navigate('/');
  }, []);

  // Google login function - IMPROVED
  const googleLogin = useCallback(async (credential) => {
    try {

      setError(null);
      setLoading(true);
      setNetworkError(false);

      if (!credential) {
        throw new Error('No credential received from Google');
      }

      const response = await sendPostRequestToBackend('auth/google-login', { token: credential });

      // Check for various error formats
      if (response.error || response.er) {
        const errorMsg = response.error || response.er || 'Google login failed - no error message received';
        setError(errorMsg);
        showNotification(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      if (response.msg && !response.success) {
        const errorMsg = response.msg;
        setError(errorMsg);
        showNotification(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      if (!response.success || !response.token) {
        const errorMsg = response.msg || response.error || 'Google login failed - no token received';
        setError(errorMsg);
        showNotification(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      // Store token first
      localStorage.setItem(TOKEN_TYPE, response.token);

      // Then fetch user data
      const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);

      if (accessUserData.error || accessUserData.er) {
        const errorMsg = accessUserData.error || accessUserData.er;
        showNotification(`Failed to get user data: ${errorMsg}`, "error");
        clearAuthData();
        return { success: false, error: errorMsg };
      }

      if (accessUserData.success && accessUserData.user) {
        setUser(accessUserData.user);
        console.log("After Login data", user, " userDataLoaded : ", userDataLoaded, " isAuthenticate : ", isAuthenticated, " isloading", loading);

        setIsAuthenticated(true);
        setNetworkError(false);
        showNotification('Google login successful! 🎉', 'success');
        navigate('/profile'); // Redirect to profile after reload

        return { success: true, user: accessUserData.user, token: response.token };
      } else {
        const errorMsg = 'Invalid user data response';
        showNotification(errorMsg, 'error');
        clearAuthData();
        return { success: false, error: errorMsg };
      }

    } catch (err) {
      const errorMsg = err.message || 'Google login failed';
      console.error('Google login error:', err);
      setError(errorMsg);

      if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        setNetworkError(true);
        showNotification('Network error. Please check your connection.', 'error');
      } else {
        showNotification('Google login failed. Please try again.', 'error');
      }

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [showNotification, clearAuthData]);

  // Function to check if user needs authentication
  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      showNotification('Please login to access this feature.', 'info');
      navigate('/login');
      return false;
    }
    return true;
  }, [isAuthenticated, showNotification, navigate]);

  // useEffect(() => {
  //   if (token && isAuthenticated) {
  //     window.location.reload();
  //   }
  // }, [setIsAuthenticated, token]);

  const value = {
    user,
    login,
    register,
    logout,
    googleLogin,
    requireAuth, // Add this for protected actions
    isLoading: loading,
    isAuthenticated,
    networkError, // Add this to show network status
    error,
    token,
    setUser,
    clearAuthData,
    userDataLoaded
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}