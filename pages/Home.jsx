import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';

const Home = () => {
  return (
    <div className="home">
      <Hero />
      <FeaturedCategories />
      <ProductGrid />
    </div>
  );
};

export default Home;