import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
import sendGetRequestToBackend from '@/components/Request/Get';
import { set } from 'mongoose';
const AuthContext = createContext();
const TOKEN_TYPE = "token";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem(TOKEN_TYPE);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  console.log("AuthContext user", user);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_TYPE);
      // console.log("Stored token:", localStorage.getItem("token"));

      if (storedToken) {
        try {

          const accessUserData = await sendGetRequestToBackend('auth/getUser', storedToken);

          if (accessUserData.er) {
            console.log("Error fetching user data:", accessUserData.er);

            showNotification(`Failed to load user: ${accessUserData.er}`, 'error');
            setUser(null);
            localStorage.removeItem(TOKEN_TYPE);
          } else {
            setUser(accessUserData.user);
          }
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem(TOKEN_TYPE);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);


  // Login actions
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await sendPostRequestToBackend('auth/login', { email, password });
      if (response.msg) {
        showNotification(response.msg, "error");
      }

      // ✅ Store token & decode user info
      localStorage.setItem(TOKEN_TYPE, response.token);
      const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);
      if (accessUserData.er) {
        showNotification(`Failed to get user data : ${accessUserData.er}`, "error");
        return false;
      }
      setUser(accessUserData.user);
      console.log("LoginPage data", accessUserData.user);

      showNotification('Login successful! 🎉', 'success');
      return response;
    } catch (err) {
      setError(err.message);
      showNotification('Login failed!', 'error');
      return false;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await sendPostRequestToBackend("auth/register", userData);
      if (response.msg) {
        showNotification(response.msg, "error");
        return false;
      }
      if (response.er) {
        showNotification(`Failed to register : ${response.er}`, "error");
      }
      if (!response.token) {
        showNotification('Invalid registration response!', 'error');
        return false;
      }
      // ✅ Decode the token and store it in user state
      localStorage.setItem(TOKEN_TYPE, response.token);

      const accessUserData = await sendGetRequestToBackend('auth/getUser', response.token);
      if (accessUserData.er) {
        showNotification(`Failed to get user data : ${accessUserData.er}`, "error");
        return false;
      }
      setUser(accessUserData.user);
      console.log("Register data", accessUserData.user);

      showNotification("Registration successful! 🎉", "success");
      return response;

    } catch (err) {
      setError(err.message);
      showNotification('Registration failed!', 'error');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setLoading(true);
    showNotification('Logging out...', 'info');

    setTimeout(() => {
      setUser(null);
      localStorage.removeItem(TOKEN_TYPE);
      setError(null);
      showNotification('Logged out successfully!', 'success');
      navigate('/login');
      setLoading(false);
    }, 800);
  }, [navigate]);

  const value = {
    user,
    login,
    register,
    logout,
    isLoading: loading,
    error,
    token,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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