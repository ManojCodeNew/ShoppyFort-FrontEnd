import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const adminToken = localStorage.getItem('adminToken');

  if (!adminUser || !adminToken || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;