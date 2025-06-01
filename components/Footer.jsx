import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import '../styles/components/footer.scss';
import Sign from '../assets/Images/sign.jpg';

const Footer = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const handleAboutUsClick = () => {

    navigate('/about-us');
  };
  const handleQuickLinkClick = (path) => {
    navigate(path);
    // Smooth scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 10); // Small delay to ensure navigation completes
  };
  // Extract unique categories from products
  const availableCategories = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    const categorySet = new Set();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });

    return Array.from(categorySet);
  }, [products]);

  // Generate quick links based on available categories
  const generateQuickLinks = () => {
    const genders = ['men', 'women', 'kids'];
    const quickLinks = [];

    genders.forEach(gender => {
      availableCategories.forEach(category => {
        // Check if products exist for this gender-category combination
        const hasProducts = products.some(product =>
          product.gender === gender && product.category === category
        );

        if (hasProducts) {
          const linkText = `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ${category}`;
          const linkPath = `/category/${gender}/${category.toLowerCase().replace(/\s+/g, '-')}`;

          quickLinks.push({
            text: linkText,
            path: linkPath,
            key: `${gender}-${category}`
          });
        }
      });
    });

    return quickLinks;
  };

  const quickLinks = generateQuickLinks();

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-content">

        {/* About Us Section */}
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            We are a premium fashion destination bringing you the latest trends in clothing, accessories, and lifestyle products. Our mission is to make fashion accessible to everyone, while upholding the highest standards of quality and style.
          </p>

          <button
            onClick={() => handleQuickLinkClick('/about-us')}
            className="about-us-btn"
          >
            Learn More
          </button>

          {/* Social Links */}
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#" aria-label="YouTube">
              <Youtube />
            </a>
          </div>
        </div>

        {/* Quick Links Section - Only show if categories are available */}
        {quickLinks.length > 0 && (
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.slice(0, 8).map(link => (
                <li key={link.key} onClick={() => handleQuickLinkClick(link.path)}>
                  <Link to={link.path}>{link.text}</Link>
                </li>
              ))}
              {availableCategories.includes('accessories') && (
                <li><Link to="/accessories">Accessories</Link></li>
              )}
            </ul>
          </div>
        )}

        {/* Contact Info Section */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          <div className="contact-info">
            <p>
              <MapPin className="icon" />
              <span>
                <strong>UAE</strong><br />
                Block B - B41-065
                <br />
              </span>
            </p>
            <p>
              <Phone className="icon" />
              <span>+971 50 870 3086</span>
            </p>
            <p>
              <Mail className="icon" />
              <span>shoppyfort2025@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Company Signature */}
      <div className="footer-signature">
        <img src={Sign} alt="Company Signature" className="sign" />
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>
            © {new Date().getFullYear()} Bhakti (F2F). All rights reserved.{' '}
            Developed by{' '}
            <a href="https://vinyasatech.com/" className="company-link">
              VINYASA
            </a>
          </p>


        </div>
      </div>
    </footer>
  );
};

export default Footer;