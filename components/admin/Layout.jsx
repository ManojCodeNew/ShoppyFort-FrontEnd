import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Tags } from 'lucide-react';
import '../../styles/components/admin/layout.scss';

const Layout = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutGrid />,
      path: '/admin'
    },
    {
      title: 'Categories',
      icon: <LayoutGrid />,
      path: '/admin/categories'
    },
    {
      title: 'Products',
      icon: <ShoppingBag />,
      path: '/admin/products'
    },
    {
      title: 'Attributes',
      icon: <Tags />,
      path: '/admin/attributes'
    }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;