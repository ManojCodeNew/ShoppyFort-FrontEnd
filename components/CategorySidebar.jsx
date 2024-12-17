import React, { useEffect, useState } from 'react';

import '../styles/components/category-sidebar.scss';

const CategorySidebar = ({ filters, onFilterChange }) => {
  const [currentPrice, setCurrentPrice] = useState(filters.priceRange.max);


  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value, 10);
    setCurrentPrice(price);
    onFilterChange('price', price);
  };

  const handleCheckboxChange = (e, filterType) => {
    const { value } = e.target;
    onFilterChange(filterType, value);
  };

  
  return (
    <div className="category-sidebar">
      <h4 className='filter-title'>FILTERS</h4>
      <div className="filters-container">
        {filters.categories.length > 1 && (
          <>
            <h5 className='categories-title'>CATEGORIES</h5>
            <div className="items">
              {filters.categories.map((item, i) => (
                <p key={i}>
                  <span><input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'categories')}
                  /> {item}</span>
                </p>
              ))}

            </div>
          </>
        )}
        {filters.brands.length > 1 && (
          <>
            <h5 className='brand-title'>BRAND</h5>
            <div className="items">
              {filters.brands.map((item, i) => (
                <p key={i}>
                  <span><input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'brands')}
                  /> {item}</span>
                </p>
              ))}
            </div>
          </>

        )}

        <h5 className='price-title'>PRICE</h5>
        <span>&#8377; {filters.priceRange.min} - </span>
        <span>&#8377; {filters.priceRange.max}</span>
        <input
          type="range"
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          value={currentPrice}
          onChange={handlePriceChange}
          className="slider"
          disabled={filters.priceRange.min === filters.priceRange.max}
        />
        <div className="price-values">
          <p className="current-price">
            current price : <span>{currentPrice}</span>
          </p>
        </div>

        {filters.colors.length > 1 && (<>
          <h5 className='color-title'>COLOR</h5>
          <div className="items">
            {filters.colors.map((item, i) => (
              <p key={i}>
                <span>
                  <input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'colors')}
                  />
                  <span className="color-show" style={{ background: item }}></span>
                  {item}</span>
              </p>
            ))}
          </div>
        </>)}

        {filters.discount.length > 1 && (
          <>
            <h5 className='discount-title'>DISCOUNT RANGE</h5>
            <div className="items">
              {filters.discount.map((item, i) => (
                <p key={i}>
                  <span><input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'discount')}
                  /> {item} % Discount</span>
                </p>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default CategorySidebar;
