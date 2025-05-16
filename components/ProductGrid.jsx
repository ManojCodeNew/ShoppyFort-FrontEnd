
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import '../styles/components/product-grid.scss';
import { useProducts } from '@/contexts/ProductsContext.jsx';

const ProductGrid = ({ gender, category, subcategory }) => {
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
        // Apply filters based on the received props
        let filteredData = products;
        
        if (gender) {
          filteredData = filteredData.filter(product => product.gender === gender);
        }
        if (category) {
          filteredData = filteredData.filter(product => product.category === category);
        }
        if (subcategory) {
          filteredData = filteredData.filter(product => product.subcategory === subcategory);
        }
        // Update the state with the filtered data
        setFilteredProducts(filteredData);
    

  }, [gender, category, subcategory,products]);
console.log("Filtered DATA",filteredProducts);

  return (
    <div className="special-offers-container">
      <h2 className='special-offers-heading'>Special Offers</h2>

      <div className="scroll-container">
        <div className="product-grid">
          {filteredProducts.length>0?(
          filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))
          ):(
            <p>No products available in this category.</p>
          )
        }
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
