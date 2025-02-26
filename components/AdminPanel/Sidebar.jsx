import React, { useState } from 'react'; // Importing useState correctly here
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';
import './styles/sidebar.css';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/' },
  { icon: ShoppingBag, text: 'Orders', path: 'manage-order' },
  { icon: Users, text: 'Customers', path: 'customers' },
  {
    icon: Package,
    text: 'Products',
    // path: 'products',
    subcategory: [
      { text: 'Add Product', path: 'products/add' },
      { text: 'Manage Product', path: 'products/manage' },
    ],
  },
  { icon: BarChart3, text: 'Subcategory', path: '/' },
  { icon: Settings, text: 'Settings', path: '/' },
];

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubMenu = (text) => {
    // Logic to toggle submenus
    setExpandedMenu(expandedMenu === text ? null : text);
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <ShoppingBag className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Shopyfort Admin</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.text} className="sidebar-menu-group">
            <NavLink
              to={item.path}
              className={`sidebar-menu-item ${item.subcategory ? 'has-submenu' : ''}`}
              onClick={() => item.subcategory && toggleSubMenu(item.text)}
            >
              <item.icon className="sidebar-menu-icon" />
              <span>{item.text}</span>
            </NavLink>

            {item.subcategory && expandedMenu === item.text && (
              <div className="sidebar-submenu">
                {item.subcategory.map((sub) => (
                  <NavLink
                    key={sub.text}
                    to={sub.path}
                    className="sidebar-submenu-item"
                  >
                    <span>{sub.text}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-button">
          <LogOut className="sidebar-logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
