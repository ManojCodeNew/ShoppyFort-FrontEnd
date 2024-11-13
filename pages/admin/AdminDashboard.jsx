import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Tags, ShoppingBag, Settings } from 'lucide-react';
import '../../styles/pages/admin/dashboard.scss';

const AdminDashboard = () => {
  const menuItems = [
    {
      title: 'Categories',
      icon: <LayoutGrid />,
      path: '/admin/categories',
      description: 'Manage categories and subcategories'
    },
    {
      title: 'Products',
      icon: <ShoppingBag />,
      path: '/admin/products',
      description: 'Add and manage products'
    },
    {
      title: 'Attributes',
      icon: <Tags />,
      path: '/admin/attributes',
      description: 'Manage product attributes like sizes, colors'
    },
    {
      title: 'Settings',
      icon: <Settings />,
      path: '/admin/settings',
      description: 'Configure store settings'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-grid">
          {menuItems.map((item) => (
            <Link to={item.path} key={item.path} className="dashboard-card">
              <div className="card-icon">{item.icon}</div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;