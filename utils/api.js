const API_URL = import.meta.env.VITE_API_URL || '/api';

export const login = async (credentials) => {
  // Mock login for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: 'Demo User',
        email: credentials.email,
        token: 'mock-token'
      });
    }, 1000);
  });
};

export const register = async (userData) => {
  // Mock registration for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: userData.name,
        email: userData.email,
        token: 'mock-token'
      });
    }, 1000);
  });
};