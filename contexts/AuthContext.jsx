import sendPostRequestToBackend from '@/components/Request/Post';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // It will check If user is present or not
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(jwtDecode(storedUser));
    }
    setLoading(false);
  }, []);

  // Login actions
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await sendPostRequestToBackend('auth/login', { email, password });
      if (response.msg) {
        throw new Error(response.msg);
      }
      
      // const user = await response.json();
      setUser(jwtDecode(response.token));

      return response;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await sendPostRequestToBackend("auth/register", userData);
    if (response.msg) {
      throw new Error(response.msg);
    }
    if (response.er) {
      throw new Error("Failed to register");
    }
      setUser(userData);
      
      return response;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.reload();
  }, []);

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