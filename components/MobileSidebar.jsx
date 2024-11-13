import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import '../styles/components/mobile-sidebar.scss';

const categories = [
  {
    title: 'Men',
    path: '/men',
    subcategories: [
      { name: 'T-Shirts & Polos', path: '/men/t-shirts' },
      { name: 'Shirts', path: '/men/shirts' },
      { name: 'Jeans', path: '/men/jeans' },
      { name: 'Trousers', path: '/men/trousers' },
      { name: 'Jackets', path: '/men/jackets' }
    ]
  },
  {
    title: 'Women',
    path: '/women',
    subcategories: [
      { name: 'Dresses', path: '/women/dresses' },
      { name: 'Tops', path: '/women/tops' },
      { name: 'Jeans', path: '/women/jeans' },
      { name: 'Skirts', path: '/women/skirts' },
      { name: 'Jackets', path: '/women/jackets' }
    ]
  },
  {
    title: 'Kids',
    path: '/kids',
    subcategories: [
      { name: 'T-Shirts', path: '/kids/t-shirts' },
      { name: 'Dresses', path: '/kids/dresses' },
      { name: 'Jeans', path: '/kids/jeans' },
      { name: 'Shorts', path: '/kids/shorts' }
    ]
  }
];

const MobileSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-sidebar-overlay">
      <div className="mobile-sidebar">
        <div className="sidebar-header">
          <h2>Categories</h2>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="sidebar-content">
          {categories.map((category) => (
            <div key={category.path} className="category-section">
              <Link 
                to={category.path} 
                className="category-title"
                onClick={onClose}
              >
                {category.title}
                <ChevronRight />
              </Link>
              <div className="subcategories">
                {category.subcategories.map((sub) => (
                  <Link 
                    key={sub.path} 
                    to={sub.path}
                    className="subcategory"
                    onClick={onClose}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;