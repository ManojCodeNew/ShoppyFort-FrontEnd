import React from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';
import '../styles/components/product-grid.scss';

const ProductGrid = ({ gender, category, subcategory }) => {
  let filteredProducts = products;

  if (gender) {
    filteredProducts = filteredProducts.filter(product => product.gender === gender);
  }

  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }

  return (
    <div className="scroll-container">

    <div className="product-grid">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    </div>

  );
};

export default ProductGrid;