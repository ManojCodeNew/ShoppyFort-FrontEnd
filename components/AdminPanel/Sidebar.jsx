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
  LogOut,
  PackageX,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useUserContext } from './Context/ManageUsersContext.jsx';
import './styles/sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { logout } = useUserContext();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close any expanded menus when collapsing
    if (!isCollapsed) {
      setExpandedMenu(null);
    }
  };

  const toggleSubMenu = (menuName) => {
    if (isCollapsed) return; // Don't toggle submenu when collapsed
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <>
      <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>


        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <ShoppingBag className="sidebar-logo-icon" />
            {!isCollapsed && <span className="sidebar-logo-text">Shopyfort Admin</span>}
          </div>
        </div>

        <nav className="sidebar-menu">
          {/* Dashboard */}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            end
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard className="sidebar-menu-icon" />
            {!isCollapsed && <span className="sidebar-menu-text">Dashboard</span>}
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/admin/manage-order"
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Orders' : ''}
          >
            <ShoppingBag className="sidebar-menu-icon" />
            {!isCollapsed && <span className="sidebar-menu-text">Orders</span>}
          </NavLink>

          {/* Returns */}
          <NavLink
            to="/admin/manage-return"
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Returns' : ''}
          >
            <PackageX className="sidebar-menu-icon" />
            {!isCollapsed && <span className="sidebar-menu-text">Returns</span>}
          </NavLink>

          {/* Add Offers */}
          <NavLink
            to="/admin/add-offer"
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? 'Add Offers' : ''}
          >
            <Gift className="sidebar-menu-icon" />
            {!isCollapsed && <span className="sidebar-menu-text">Add Offers</span>}
          </NavLink>

          {/* Products (with Submenu) */}
          <div className="sidebar-menu-group">
            <div
              className={`sidebar-menu-item has-submenu ${(window.location.pathname.includes('/admin/products') || expandedMenu === 'products') ? 'active' : ''
                }`}
              onClick={() => toggleSubMenu("products")}
              title={isCollapsed ? 'Products' : ''}
            >
              <Package className="sidebar-menu-icon" />
              {!isCollapsed && (
                <>
                  <span className="sidebar-menu-text">Products</span>
                  <div className="sidebar-submenu-arrow">
                    {expandedMenu === "products" ?
                      <ChevronDown size={16} /> :
                      <ChevronRight size={16} />
                    }
                  </div>
                </>
              )}
            </div>

            {!isCollapsed && expandedMenu === "products" && (
              <div className="sidebar-submenu">
                <NavLink
                  to="/admin/products/add"
                  className={({ isActive }) =>
                    `sidebar-submenu-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span>Add Product</span>
                </NavLink>
                <NavLink
                  to="/admin/products/manage"
                  className={({ isActive }) =>
                    `sidebar-submenu-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span>Manage Product</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-button"
            onClick={logout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="sidebar-logout-icon" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
        <div>
          {/* Toggle Button */}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            {isCollapsed ?
              <span>&#8594;</span>
              :
              <span>&#8592;</span>
            }
          </button>
        </div>
      </div>

    </>
  );
};

export default Sidebar;