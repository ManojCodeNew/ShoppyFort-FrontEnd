import React, { useEffect, useState } from 'react';
import '../styles/components/category-sidebar.scss';

const CategorySidebar = ({ filters, onFilterChange }) => {
  const [currentPrice, setCurrentPrice] = useState(filters.priceRange.max);

  // Color mapping for proper color display
  const colorMap = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'black': '#000000',
    'white': '#FFFFFF',
    'pink': '#FFC0CB',
    'purple': '#800080',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'fuchsia': '#FF00FF',
  };
  const formatText = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getColorValue = (colorName) => {
    const lowerColor = colorName.toLowerCase();
    return colorMap[lowerColor] || colorName;
  };

  const handlePriceChange = (e) => {
    const price = parseInt(e.target.value, 10);
    setCurrentPrice(price);
    onFilterChange('price', price);
  };

  const handleCheckboxChange = (e, filterType) => {
    const { value } = e.target;
    onFilterChange(filterType, value);
  };

  // Update current price when filters change
  useEffect(() => {
    setCurrentPrice(filters.priceRange.max);
  }, [filters.priceRange.max]);

  return (
    <div className="category-sidebar">
      <h4 className='filter-title'>FILTERS</h4>
      <div className="filters-container">
        {filters.categories.length > 1 && (
          <div className="filter-section">
            <h5 className='section-title'>CATEGORIES</h5>
            <div className="filter-items">
              {filters.categories.map((item, i) => (
                <label key={i} className="filter-item">
                  <input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'categories')}
                  />
                  <span className="checkmark"></span>
                  <span className="item-label">{formatText(item)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {filters.brands.length > 1 && (
          <div className="filter-section">
            <h5 className='section-title'>BRAND</h5>
            <div className="filter-items">
              {filters.brands.map((item, i) => (
                <label key={i} className="filter-item">
                  <input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'brands')}
                  />
                  <span className="checkmark"></span>
                  <span className="item-label">{formatText(item)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="filter-section">
          <h5 className='section-title'>PRICE</h5>
          <div className="price-range-display">
            <span>₹{filters.priceRange.min}</span>
            <span>-</span>
            <span>₹{filters.priceRange.max}</span>
          </div>
          <input
            type="range"
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            value={currentPrice}
            onChange={handlePriceChange}
            className="price-slider"
            disabled={filters.priceRange.min === filters.priceRange.max}
          />
          <div className="current-price-display">
            <span>Current: ₹{currentPrice}</span>
          </div>
        </div>

        {filters.colors.length > 1 && (
          <div className="filter-section">
            <h5 className='section-title'>COLOR</h5>
            <div className="filter-items color-items">
              {filters.colors.map((item, i) => (
                <label key={i} className="color-filter-item filter-item">
                  <input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'colors')}
                  />
                  <span className="checkmark"></span>
                  <div className="color-display">
                    <span
                      className="color-swatch"
                      style={{
                        backgroundColor: getColorValue(item),
                        border: item.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
                      }}
                    ></span>
                    <span className="color-name">{formatText(item)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {filters.discount.length > 1 && (
          <div className="filter-section">
            <h5 className='section-title'>DISCOUNT RANGE</h5>
            <div className="filter-items">
              {filters.discount.map((item, i) => (
                <label key={i} className="filter-item">
                  <input
                    type="checkbox"
                    name={item}
                    value={item}
                    onChange={(e) => handleCheckboxChange(e, 'discount')}
                  />
                  <span className="checkmark"></span>
                  <span className="item-label">{item}% Discount</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;