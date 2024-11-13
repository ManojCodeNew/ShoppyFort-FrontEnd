import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/category-sidebar.scss';

const categories = {
  men: {
    name: 'Men',
    subcategories: [
      { id: 1, name: 'T-Shirts', path: '/men/t-shirts' },
      { id: 2, name: 'Shirts', path: '/men/shirts' },
      { id: 3, name: 'Jeans', path: '/men/jeans' },
      { id: 4, name: 'Trousers', path: '/men/trousers' },
      { id: 5, name: 'Jackets', path: '/men/jackets' }
    ]
  },
  women: {
    name: 'Women',
    subcategories: [
      { id: 1, name: 'Dresses', path: '/women/dresses' },
      { id: 2, name: 'Tops', path: '/women/tops' },
      { id: 3, name: 'Jeans', path: '/women/jeans' },
      { id: 4, name: 'Skirts', path: '/women/skirts' },
      { id: 5, name: 'Jackets', path: '/women/jackets' }
    ]
  },
  kids: {
    name: 'Kids',
    subcategories: [
      { id: 1, name: 'T-Shirts', path: '/kids/t-shirts' },
      { id: 2, name: 'Dresses', path: '/kids/dresses' },
      { id: 3, name: 'Jeans', path: '/kids/jeans' },
      { id: 4, name: 'Shorts', path: '/kids/shorts' }
    ]
  }
};

const CategorySidebar = ({ selectedCategory }) => {
  const category = categories[selectedCategory];

  if (!category) return null;

  return (
    <div className="category-sidebar">
      <h2>{category.name}</h2>
      <div className="category-list">
        <h3>Categories</h3>
        <ul>
          {category.subcategories.map((subcat) => (
            <li key={`${selectedCategory}-${subcat.id}`}>
              <Link to={subcat.path}>{subcat.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-section">
          <h4>Price Range</h4>
          <ul>
            <li>
              <label>
                <input type="checkbox" /> Under ₹500
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> ₹500 - ₹1000
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> ₹1000 - ₹2000
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Above ₹2000
              </label>
            </li>
          </ul>
        </div>

        <div className="filter-section">
          <h4>Brand</h4>
          <ul>
            <li>
              <label>
                <input type="checkbox" /> Nike
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Adidas
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Puma
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Levi's
              </label>
            </li>
          </ul>
        </div>

        <div className="filter-section">
          <h4>Discount</h4>
          <ul>
            <li>
              <label>
                <input type="checkbox" /> 10% and above
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> 20% and above
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> 30% and above
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> 40% and above
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;