import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaStore, FaGlobe, FaShieldAlt, FaUsers, FaCertificate, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import '../styles/pages/AboutUs.css';
const AboutUs = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleWhatsAppClick = () => {
        // Replace with your actual WhatsApp number
        const phoneNumber = "+919482292440"; // Update this with your actual number
        const message = "Hello! I'm interested in your products.";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const licenseInfo = [
        { label: 'License No.', value: '8156', icon: <FaCertificate /> },
        { label: 'Legal Status', value: 'Free Zone Establishment', icon: <FaShieldAlt /> },
        { label: 'Incorporation Date', value: '07/11/2024', icon: <FaCalendarAlt /> },
        { label: 'Expiry Date', value: '06/11/2025', icon: <FaCalendarAlt /> },
        { label: 'Location', value: 'Block B - B41-065, STRIP', icon: <FaMapMarkerAlt /> }
    ];

    const activities = [
        { title: 'E-Commerce Through Websites', icon: <FaGlobe />, description: 'Modern online shopping experiences' },
        { title: 'E-Commerce Through Social Media', icon: <FaUsers />, description: 'Social commerce solutions' },
        { title: 'General Trading', icon: <FaStore />, description: 'Comprehensive trading services' },
        { title: 'Textile Trading', icon: <FaStore />, description: 'Quality textile products' }
    ];

    return (
        <div className={`about-container ${isVisible ? 'visible' : ''}`}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <FaShieldAlt className="badge-icon" />
                        <span>Licensed & Verified</span>
                    </div>
                    <h1 className="hero-title">
                        Welcome to <span className="brand-name">Bhakti (FZE)</span>
                    </h1>
                    <p className="hero-subtitle">
                        Your trusted partner in e-commerce and trading solutions, officially licensed in Sharjah Free Zone
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">2024</span>
                            <span className="stat-label">Established</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4+</span>
                            <span className="stat-label">Business Activities</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Legal Compliance</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card">
                        <FaCertificate className="card-icon" />
                        <h3>Licensed Business</h3>
                        <p>Officially registered and compliant</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="section-header">
                    <h2>About Our Company</h2>
                    <p>Bhakti (FZE) is a legally established Free Zone company in Sharjah, specializing in modern e-commerce solutions and trading services.</p>
                </div>

                <div className="about-grid">
                    <div className="about-card">
                        <div className="card-icon-wrapper">
                            <FaStore />
                        </div>
                        <h3>Our Mission</h3>
                        <p>To provide exceptional e-commerce and trading services while maintaining the highest standards of legal compliance and customer satisfaction.</p>
                    </div>

                    <div className="about-card">
                        <div className="card-icon-wrapper">
                            <FaUsers />
                        </div>
                        <h3>Our Vision</h3>
                        <p>To be the leading e-commerce platform in the region, connecting businesses and customers through innovative digital solutions.</p>
                    </div>

                    <div className="about-card">
                        <div className="card-icon-wrapper">
                            <FaShieldAlt />
                        </div>
                        <h3>Our Values</h3>
                        <p>Trust, transparency, and excellence in everything we do. We believe in building lasting relationships with our customers and partners.</p>
                    </div>
                </div>
            </section>

            {/* Activities Section */}
            <section className="activities-section">
                <div className="section-header">
                    <h2>Our Business Activities</h2>
                    <p>We are authorized to conduct the following business activities under our commercial license</p>
                </div>

                <div className="activities-grid">
                    {activities.map((activity, index) => (
                        <div key={index} className="activity-card" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="activity-icon">
                                {activity.icon}
                            </div>
                            <h3>{activity.title}</h3>
                            <p>{activity.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* License Information Section */}
            <section className="license-section">
                <div className="section-header">
                    <h2>License Information</h2>
                    <p>Official registration details and compliance information</p>
                </div>

                <div className="license-grid">
                    <div className="license-main-card">
                        <div className="license-header">
                            <FaCertificate className="license-icon" />
                            <div>
                                <h3>Bhakti (FZE)</h3>
                                <p>Free Zone Establishment</p>
                            </div>
                        </div>
                        <div className="license-owner">
                            <h4>Owned & Managed by</h4>
                            <p>Vidya Nithin Hariyappa Devadiga</p>
                        </div>
                    </div>

                    <div className="license-details">
                        {licenseInfo.map((info, index) => (
                            <div key={index} className="license-item">
                                <div className="license-item-icon">{info.icon}</div>
                                <div className="license-item-content">
                                    <span className="license-label">{info.label}</span>
                                    <span className="license-value">{info.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="license-note">
                    <FaShieldAlt className="note-icon" />
                    <p>
                        This license is issued based upon Emiri Decree No. 38 of 2016, issued in Sharjah on June 19, 2016.
                        This license is granted to the licensee only and shall not be leased or transferred without prior approval of STRIP.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <div className="contact-content">
                    <h2>Get in Touch</h2>
                    <p>Have questions about our services? We're here to help!</p>
                    <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
                        <FaWhatsapp />
                        <span>Chat on WhatsApp</span>
                    </button>
                </div>
            </section>

            {/* Floating WhatsApp Button */}
            <div className="floating-whatsapp" onClick={handleWhatsAppClick}>
                <FaWhatsapp />
            </div>
        </div>
    );
};

export default AboutUs;