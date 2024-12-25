import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import '../styles/components/mobile-sidebar.scss';
import { useProducts } from '@/contexts/ProductsContext';


const groupProductsByGenderAndCategory = (products) => {
  return products.reduce((acc, product) => {
    const genderCategory = product.gender;
    const productCategory = product.category;

    if (!acc[genderCategory]) {
      acc[genderCategory] = {
        title: genderCategory,
        path: `/${genderCategory}`,
        subcategories: [],
      };
    }

    // Check if the subcategory is already added
    if (!acc[genderCategory].subcategories.some(sub => sub.name === productCategory)) {
      acc[genderCategory].subcategories.push({
        name: productCategory,
        path: `/${genderCategory}/${productCategory}`,
      });
    }

    return acc;
  }, {});
};


const MobileSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
const {products}=useProducts();
  const groupedCategories = groupProductsByGenderAndCategory(products);
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
          {Object.values(groupedCategories).map((category) => (
            <div key={category.path} className="category-section">
              
              <Link 
                to={`category${category.path}`}  
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
                    to={`category${sub.path}`}
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