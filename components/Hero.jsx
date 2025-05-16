// Hero.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Loader } from 'lucide-react';
import '../styles/components/hero.scss';
import { useOffers } from '@/contexts/OffersContext';

const Hero = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { offers, loadingOffers, errorOffers } = useOffers();
  const [filteredOffersForBanner, setFilteredOffersForBanner] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleShopNowClick = (banner) => {
    navigate(`/offers/${banner._id}`);
  };

  useEffect(() => {
    if (offers && offers.length > 0) {
      setFilteredOffersForBanner(offers);
      setIsLoading(false);
    } else if (loadingOffers) {
      setIsLoading(true);
    } else if (errorOffers) {
      setIsLoading(false);
      setFilteredOffersForBanner([
        { _id: 'error', title: 'Error loading!', imageUrl: '...', link: '/', discountText: null, productIds: [] },
      ]);
    } else {
      setIsLoading(false);
      setFilteredOffersForBanner([
        { _id: 'default', title: 'Explore!', imageUrl: '...', link: '/offers', discountText: null, productIds: [] },
      ]);
    }
  }, [offers, loadingOffers, errorOffers]);

  useEffect(() => {
    if (filteredOffersForBanner.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % filteredOffersForBanner.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [filteredOffersForBanner.length]);

  if (isLoading) {
    return <div className="hero-loading"><Loader className="spinner" /><p>Loading Banners...</p></div>;
  }

  if (filteredOffersForBanner.length === 0) {
    return null;
  }

  const banner = filteredOffersForBanner[currentBanner];

  return (
    <div className="hero" style={{ backgroundImage: `url(${banner.imageUrl})` }}>
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1>{banner.title}</h1>
            {banner.description && <p>{banner.description}</p>}
            <button onClick={() => handleShopNowClick(banner)} className="cta-button">
              Shop Now
            </button>
          </div>
        </div>
      </div>
      {filteredOffersForBanner.length > 1 && (
        <div className="hero-dots">
          {filteredOffersForBanner.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;