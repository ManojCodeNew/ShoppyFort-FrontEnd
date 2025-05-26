import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import '../styles/components/footer.scss';
import Sign from '../assets/Images/sign.jpg';

const Footer = () => {
  const navigate = useNavigate();

  const handleAboutUsClick = () => {
    navigate('/about-us');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <button 
            onClick={handleAboutUsClick}
            className="about-us-btn"
          >
            About Us
          </button>
          <p>
            We are a premium fashion destination offering the latest trends in clothing,
            accessories, and lifestyle products. Our mission is to make fashion accessible
            to everyone while maintaining the highest quality standards.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Youtube />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/men">Men's Fashion</Link></li>
            <li><Link to="/women">Women's Fashion</Link></li>
            <li><Link to="/kids">Kids' Fashion</Link></li>
            <li><Link to="/accessories">Accessories</Link></li>
            <li><Link to="/new-arrivals">New Arrivals</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping Information</Link></li>
            <li><Link to="/returns">Returns & Exchanges</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <div className="contact-info">
            <p>
              <MapPin className="icon" />
              Fashion Store
              <br />Mangalore, DK 575001
            </p>
            <p>
              <Phone className="icon" />
              +91 9876543210
            </p>
            <p>
              <Mail className="icon" />
              support@fashionstore.com
            </p>
          </div>
        </div>
      </div>

      <div className="signature-of-ragavendraswami">
        <img src={Sign} alt="Signature" className="sign" />
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>
            &copy; {new Date().getFullYear()} Fashion Store. All rights reserved.{' '}
            <span>
              Developed by{' '}
              <a 
                href="https://vinyasatech.com/" 
                className="company-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                VINYASA
              </a>
            </span>
          </p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;