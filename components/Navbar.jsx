import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import MobileSidebar from './MobileSidebar.jsx';
import SearchBar from './SearchBar.jsx';
import '../styles/components/navbar.scss';
import logo from '../assets/Images/shoppyfort_logo.png';
import heart from '../assets/Images/heart.png';
import ShoppingBag from '../assets/Images/bag.png';
import User from '../assets/Images/user.png';
import { useUserNotifications } from '@/contexts/UserNotificationContext';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { logout, user, token } = useAuth();
  const { hasUnread } = useUserNotifications();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const userProfile = user ? (
    <>
      <Link to="/profile" className='user-details'>
        <p className='user-name'>{user.fullname}</p>
        <p className='user-email'>{user.phoneno}</p>
      </Link>

      <Link to='/orders' className='user-order-link'>
        <p className='user-order'>Orders</p>
      </Link>

      <Link to='/notifications' className='user-notification-link'>
        <p className='user-notification'>
          Notification
          {hasUnread && <span className="dot-blink" />}
        </p>
      </Link>

      <Link to='/wallet' className='user-wallet-link'>
        <p className='user-wallet'>
          Wallet
        </p></Link>

      <p className='user-logout' onClick={logout}>Logout</p>
    </>

  ) : (
    <>
      <div className="Guest-container">
        <h5>Welcome</h5>
        <p>Sign in to continue.</p>
        <Link to='/login'>
          <button className='sign-in'>Sign in</button>
        </Link>
      </div>
      <hr className='underline' />
      <Link to='/login' className='user-order-link'>
        <p className='user-order'>Orders</p>
      </Link>
      <Link to='/login' className='user-notification-link'>
        <p className='user-notification'>Notification</p>
      </Link>
    </>
  );

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-container" >
          <button
            className="menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div className="nav-left" >
            <Link to="/" className="logo">
              <img src={logo} alt="Shoppyfort Logo" />
            </Link>
            {/* <div className="search-container"> */}
              <SearchBar />
            {/* </div> */}
          </div>

          <div className="nav-actions">
            <div className="nav-action-profile"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="user-icon-wrapper">
                <img src={User} alt="User Profile" className='user-icon' />
                {hasUnread && <span className="dot-blink" />}
              </div>
              <span className='profile-title'>Profile</span>

              {isHovered && (
                <div className="popup-profile"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <h4>Profile Details</h4>
                  {userProfile}
                </div>
              )}

            </div>

            <Link to={user ? "/wishlist" : "/login"} className="nav-action">
              <img src={heart} alt="" className='heart-icon' />
              <span>Wishlist</span>
              {wishlistItems > 0 && (
                <span className="badge">{wishlistItems}</span>
              )}
            </Link>

          
              <Link to={user ? "/cart" : "/login"} className="nav-action">
                <img src={ShoppingBag} alt="ShoppingBag" className='ShoppingBag-icon' />
                <span>Cart</span>
                {cartItems > 0 && (
                  <span className="badge">{cartItems}</span>
                )}
              </Link>

          </div>
        </div>
      </nav>

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

    </header>
  );
};

export default Navbar;