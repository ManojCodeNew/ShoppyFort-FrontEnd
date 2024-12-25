import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductGrid from '../components/ProductGrid';
import Add from '@/components/Add';
import { useAuth } from '@/contexts/AuthContext';
import ProductShow from '@/components/ProductShow';
import SearchBar from '@/components/SearchBar';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="home-search-bar-container" >
        <SearchBar />
      </div>
      <Hero />
      <Add title="Winter Wardrobe Sale! ❄️" desc="Get up to 50% OFF on cozy sweaters, chic jackets, and winter essentials. Shop now to stay stylish and warm all season long! 🛒 Free Shipping on orders over $50! 🌍 Worldwide delivery available!." bgcolor="#bff6fe" />
      {/* <FeaturedCategories /> */}
      <ProductShow />
      <ProductGrid />
      <Add title="Summer Wardrobe Sale! ❄️" desc="Get up to 100% OFF on cozy sweaters, chic jackets, and winter essentials. Shop now to stay stylish and warm all season long! 🛒 Free Shipping on orders over $100! 🌍 Worldwide delivery available!." bgcolor="rgb(96, 208, 145)" />
    </div>
  );
};

export default Home;