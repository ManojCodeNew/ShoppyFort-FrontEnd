import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNotification } from '@/components/Notify/NotificationProvider.jsx';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // It will check If user is present or not
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(jwtDecode(storedUser));
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
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
      localStorage.setItem('user', response.token);
      setUser(jwtDecode(response.token));
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
      setUser(jwtDecode(response.token));
      localStorage.setItem('user', response.token);
      showNotification("Registration successful! 🎉", "success");
      return response;

    } catch (err) {
      setError(err.message);
      showNotification('Registration failed!', 'error');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    setError(null);
    showNotification('Logged out successfully!', 'success');
    navigate('/login');
    setTimeout(() => window.location.reload(), 500);
  }, [navigate]);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error
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