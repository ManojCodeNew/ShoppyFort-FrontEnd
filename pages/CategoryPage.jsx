import React from 'react';
import { useParams } from 'react-router-dom';
import { categories } from '../data/categories';
import CategorySidebar from '../components/CategorySidebar';
import ProductGrid from '../components/ProductGrid';
import '../styles/pages/category-page.scss';

function CategoryPage() {
  const { gender, category, subcategory } = useParams();
  const categoryData = categories[gender];

  if (!categoryData) {
    return <div className="error">Category not found</div>;
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-layout">
          <CategorySidebar 
            categories={categoryData} 
            selectedCategory={category}
            selectedSubcategory={subcategory}
            gender={gender}
          />
          <div className="category-content">
            <h1 className="category-title">
              {gender.charAt(0).toUpperCase() + gender.slice(1)} {category ? `- ${category}` : ''}
            </h1>
            <ProductGrid 
              gender={gender}
              category={category}
              subcategory={subcategory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;