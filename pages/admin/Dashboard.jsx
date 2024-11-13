import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Tags } from 'lucide-react';
import '../../styles/pages/admin/dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    attributes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Mock data fetch
      setStats({
        categories: 3, // From Categories mock data
        products: 2,   // From Products mock data
        attributes: 2  // From Attributes mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Categories',
      icon: <LayoutGrid size={24} />,
      path: '/admin/categories',
      count: stats.categories
    },
    {
      title: 'Products',
      icon: <ShoppingBag size={24} />,
      path: '/admin/products',
      count: stats.products
    },
    {
      title: 'Attributes',
      icon: <Tags size={24} />,
      path: '/admin/attributes',
      count: stats.attributes
    }
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        {menuItems.map((item) => (
          <Link to={item.path} key={item.path} className="stat-card">
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-info">
              <h3>{item.title}</h3>
              <p className="stat-count">{item.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;