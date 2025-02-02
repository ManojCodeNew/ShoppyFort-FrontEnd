import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import CartModal from './CartModal';
import MobileSidebar from './MobileSidebar';
import SearchBar from './SearchBar';
import '../styles/components/navbar.scss';
import logo from '../../dist/assets/logo.png';
import heart from '../assets/Images/heart.png';
import ShoppingBag from '../assets/Images/bag.png';
import User from '../assets/Images/user.png';


const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { totalItems: cartItems } = useCart();

  const { totalItems: wishlistItems } = useWishlist();
  const [isHovered, setisHovered] = useState(false);
  const { logout, user } = useAuth();
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-container" >
          <button
            className="menu-button"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu />
          </button>

          <div className="nav-left" >
            <Link to="/" className="logo">
              <img src={logo} alt="" />
            </Link>
            {/* <div className="search-bar-container"> */}

            <SearchBar />
            {/* </div> */}
          </div>

          <div className="nav-actions">
            <div className="nav-action-profile"
              onMouseEnter={() => setisHovered(true)}
              onMouseLeave={() => setisHovered(false)} >

              <img src={User} alt="User" className='user-icon' />

              <span className='profile-title'>Profile</span>
              {isHovered && (
                <div className="popup-profile"
                  onMouseEnter={() => setisHovered(true)}
                >
                  <h4>Profile Details</h4>
                  {user ?
                    <Link to="/profile" className='user-details'>
                      <p className='user-name'>{user.fullname}</p>
                      <p className='user-email'>{user.phoneno}</p>
                    </Link>
                    :
                    <div className="Guest-container">
                      <h5>Welcome</h5>
                      <p>Sign in to continue.</p>
                      <Link to='/login' ><button className='sign-in'>Sign in</button></Link>
                    </div>
                  }
                  <hr className='underline' />
                  {
                    user ?
                      <Link to='/orders' className='user-order-link'><p className='user-order'>Orders</p></Link>
                      :
                      <Link to='/login' className='user-order-link'><p className='user-order'>Orders</p></Link>

                  }
                  {user && (
                    <p className='user-logout' onClick={() => logout()}>logout</p>
                  )}
                </div>
              )}

            </div>
            <Link to="/wishlist" className="nav-action">
              <img src={heart} alt="" className='heart-icon' />
              <span>Wishlist</span>
              {wishlistItems > 0 && (
                <span className="badge">{wishlistItems}</span>
              )}
            </Link>
            <button
              className="nav-action"
              onClick={() => setIsCartOpen(false)}
            >
              <Link to="/cart" className="nav-action">

                <img src={ShoppingBag} alt="ShoppingBag" className='ShoppingBag-icon' />
                <span>Cart</span>
                {cartItems > 0 && (
                  <span className="badge">{cartItems}</span>
                )}
              </Link>

            </button>
          </div>
        </div>
      </nav>

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};

export default Navbar;