import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import '../styles/components/footer.scss';
import Sign from "../../dist/assets/sign.jpg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
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
              Fashion store
              <br />Mangalore, DK 00000
            </p>
            <p>
              <Phone className="icon" />
              +91 0000000000
            </p>
            <p>
              <Mail className="icon" />
              support@fashionstore.com
            </p>
          </div>
        </div>
      </div>
<div className="signature-of-ragavendraswami">
  <img src={Sign} alt="" className='sign'/>
</div>
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Fashion Store. All rights reserved.</p>
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