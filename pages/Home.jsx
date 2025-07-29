import React from 'react';
import '../styles/pages/home.scss';
import Hero from '../components/Hero';
import Add from '@/components/Add';
// import { useAuth } from '@/contexts/AuthContext';
import AllProductShow from '@/components/AllProductShow';
import SearchBarMobile from '@/components/SearchBarMobile';
import AppBackButton from '@/AppBackButton';

const Home = () => {
  // const { user } = useAuth();

  return (
    <div className="home-page-bg">
      <div className="home-main-container">
        {/* Mobile-only SearchBar */}
        <div className="mobile-only-search">
          <SearchBarMobile />
        </div>
        <section className="home-hero-section">
          <Hero />
        </section>
        <section className="home-products-section">
          <h2 className="home-section-title">Explore All Products</h2>
          <AllProductShow />
        </section>
      </div>
    </div>
  );
};

export default Home;