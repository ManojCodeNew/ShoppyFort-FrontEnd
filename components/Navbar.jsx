import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import CartModal from './CartModal';
import MobileSidebar from './MobileSidebar';
import SearchBar from './SearchBar';
import '../styles/components/navbar.scss';

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-container">
          <button 
            className="menu-button"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu />
          </button>

          <div className="nav-left">
            <Link to="/" className="logo">
              Shoppy Fort
            </Link>
            <SearchBar />
          </div>

          <div className="nav-actions">
            <Link to="/profile" className="nav-action">
              <User />
              <span>Profile</span>
            </Link>
            <Link to="/wishlist" className="nav-action">
              <Heart />
              <span>Wishlist</span>
              {wishlistItems > 0 && (
                <span className="badge">{wishlistItems}</span>
              )}
            </Link>
            <button 
              className="nav-action"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag />
              <span>Bag</span>
              {cartItems > 0 && (
                <span className="badge">{cartItems}</span>
              )}
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