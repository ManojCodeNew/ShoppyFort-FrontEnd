// Hero.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/components/hero.scss';
import { useOffers } from '@/contexts/OffersContext';

const Hero = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { offers, loadingOffers, errorOffers, fetchOffersForUser } = useOffers();
  const [filteredOffersForBanner, setFilteredOffersForBanner] = useState([]);
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const handleShopNowClick = (banner) => {
    navigate(`/offers/${banner._id}`);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % filteredOffersForBanner.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + filteredOffersForBanner.length) % filteredOffersForBanner.length);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && filteredOffersForBanner.length > 1) {
      nextBanner();
    }
    if (isRightSwipe && filteredOffersForBanner.length > 1) {
      prevBanner();
    }
  };

  // Truncate text helper function
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    fetchOffersForUser()
  }, [])

  useEffect(() => {
    if (offers && offers.length > 0) {
      setFilteredOffersForBanner(offers);
      setIsLoading(false);
    } else if (loadingOffers) {
      setIsLoading(true);
    } else if (errorOffers) {
      setIsLoading(false);
      setFilteredOffersForBanner([
        { _id: 'error', title: 'Error loading offers!', description: 'Please try again later', imageUrl: 'https://t3.ftcdn.net/jpg/05/47/69/58/240_F_547695839_IujiLmCh7AgbYd2Eyk5hgQcCYftTqQxV.jpg', link: '/', discountText: null, productIds: [] },
      ]);
    } else {
      setIsLoading(false);
      setFilteredOffersForBanner([
        { _id: 'default', title: 'Premium Collection', description: 'Discover luxury fashion with exclusive designs and premium quality', imageUrl: 'https://t3.ftcdn.net/jpg/05/47/69/58/240_F_547695839_IujiLmCh7AgbYd2Eyk5hgQcCYftTqQxV.jpg', link: '/offers', discountText: '30% OFF', productIds: [] },
      ]);
    }
  }, [offers, loadingOffers, errorOffers]);

  useEffect(() => {
    if (filteredOffersForBanner.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % filteredOffersForBanner.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [filteredOffersForBanner.length]);

  if (isLoading) {
    return (
      <section className="home-hero-section">
        <div className="hero-loading">
          <Loader className="spinner" />
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (filteredOffersForBanner.length === 0) {
    return null;
  }

  return (
    <section className="home-hero-section">
      <div 
        className="hero" 
        ref={heroRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hero-slider">
          {filteredOffersForBanner.map((offer, index) => (
            <div
              key={offer._id}
              className={`hero-slide ${index === currentBanner ? 'active' : ''}`}
              style={{ backgroundImage: `url(${offer.imageUrl})` }}
            >
              {/* Luxury sparkles */}
              <div className="sparkles">
                <div className="sparkle sparkle-1">✨</div>
                <div className="sparkle sparkle-2">✨</div>
                <div className="sparkle sparkle-3">✨</div>
              </div>

              {/* Elegant overlay */}
              <div className="hero-overlay"></div>

              {/* Content overlay */}
              <div className="hero-content-overlay">
                <div className="content-container">
                  {offer.discountText && (
                    <div className="discount-badge">
                      {offer.discountText}
                    </div>
                  )}
                  <h1>{truncateText(offer.title, 50)}</h1>
                  {offer.description && (
                    <p>{truncateText(offer.description, 120)}</p>
                  )}
                  <button onClick={() => handleShopNowClick(offer)} className="cta-button">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        {filteredOffersForBanner.length > 1 && (
          <>
            <button className="hero-nav prev" onClick={prevBanner}>
              <ChevronLeft size={16} />
            </button>
            <button className="hero-nav next" onClick={nextBanner}>
              <ChevronRight size={16} />
            </button>
            
            <div className="hero-dots">
              {filteredOffersForBanner.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentBanner ? 'active' : ''}`}
                  onClick={() => setCurrentBanner(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Hero;