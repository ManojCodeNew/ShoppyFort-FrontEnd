import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  BarChart3,
  LogOut 
} from 'lucide-react';
import './styles/sidebar.css'; 

const menuItems = [
  { icon: LayoutDashboard, text: 'Dashboard', active: true },
  { icon: ShoppingBag, text: 'Orders' },
  { icon: Users, text: 'Customers' },
  { icon: Package, text: 'Products' },
  { icon: BarChart3, text: 'Subcategory' },
  { icon: Settings, text: 'Settings' },
];

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <ShoppingBag className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Shopyfort Admin</span>
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <a
            key={item.text}
            href="#"
            className={`sidebar-menu-item ${item.active ? 'active' : ''}`}
          >
            <item.icon className="sidebar-menu-icon" />
            <span>{item.text}</span>
          </a>
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
}
export default Sidebar;