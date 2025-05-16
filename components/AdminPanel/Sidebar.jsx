import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Settings,
  Tag,
  Gift,
  LogOut
} from 'lucide-react';
import './styles/sidebar.css';

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <ShoppingBag className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Shopyfort Admin</span>
      </div>

      <nav className="sidebar-menu">
        {/* Dashboard */}
        <NavLink to="/admin" className="sidebar-menu-item">
          <LayoutDashboard className="sidebar-menu-icon" />
          <span>Dashboard</span>
        </NavLink>

        {/* Orders */}
        <NavLink to="/admin/manage-order" className="sidebar-menu-item">
          <ShoppingBag className="sidebar-menu-icon" />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/admin/manage-return" className="sidebar-menu-item">
          <Gift className="sidebar-menu-icon" />
          <span>Returns</span>
        </NavLink>
        {/* Customers */}
        {/* <NavLink to="/admin/customers" className="sidebar-menu-item">
          <Users className="sidebar-menu-icon" />
          <span>Customers</span>
        </NavLink> */}

        {/* Add Offers */}
        <NavLink to="/admin/add-offer" className="sidebar-menu-item">
          <Gift className="sidebar-menu-icon" />
          <span>Add Offers</span>
        </NavLink>

        {/* Products (with Submenu) */}
        <div className="sidebar-menu-group">
          <div className="sidebar-menu-item has-submenu" onClick={() => toggleSubMenu("products")}>
            <Package className="sidebar-menu-icon" />
            <span>Products</span>
          </div>

          {expandedMenu === "products" && (
            <div className="sidebar-submenu">
              <NavLink to="/admin/products/add" className="sidebar-submenu-item">
                <span>Add Product</span>
              </NavLink>
              <NavLink to="/admin/products/manage" className="sidebar-submenu-item">
                <span>Manage Product</span>
              </NavLink>
              <NavLink to="/admin/categories/manage" className="sidebar-submenu-item">
                <span>Manage Categories</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings */}
        {/* <NavLink to="/admin/settings" className="sidebar-menu-item">
          <Settings className="sidebar-menu-icon" />
          <span>Settings</span>
        </NavLink> */}
      </nav>

      {/* Logout */}
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
