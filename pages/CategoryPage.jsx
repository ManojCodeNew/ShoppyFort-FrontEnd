
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '@/contexts/ProductsContext';
import '../styles/pages/category-page.scss';
import ProductCard from '@/components/ProductCard';

function CategoryPage() {
  const { gender, category, subcategory } = useParams();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { products } = useProducts();
  const location = useLocation();

  // Initial filter state
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    colors: [],
    discount: [],
    price: null,
  });


  // Filter products based on gender, category, and selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesGender = gender ? product.gender === gender : true;
      const matchesCategory = category ? product.category === category : true;
      const matchesSubcategory = subcategory ? product.subcategory === subcategory : true;

      const matchesSelectedCategories =
        selectedFilters.categories.length === 0 ||
        selectedFilters.categories.includes(product.category);

      const matchesSelectedBrands =
        selectedFilters.brands.length === 0 ||
        selectedFilters.brands.includes(product.brand);

      const matchesSelectedColors =
        selectedFilters.colors.length === 0 ||
        selectedFilters.colors.some((color) => product.colors.includes(color));

      const matchesSelectedDiscount =
        selectedFilters.discount.length === 0 ||
        selectedFilters.discount.some((discount) => product.discount >= discount);

      const matchesPrice =
        selectedFilters.price === null ||
        product.price <= selectedFilters.price;

      return (
        matchesGender &&
        matchesCategory &&
        matchesSubcategory &&
        matchesSelectedCategories &&
        matchesSelectedBrands &&
        matchesSelectedColors &&
        matchesSelectedDiscount &&
        matchesPrice
      );
    });
  }, [products, gender, category, subcategory, selectedFilters]);


  // Extract unique values for filters and organize into an object
  const filters = useMemo(() => {
    const filterData = {
      categories: new Set(),
      brands: new Set(),
      colors: new Set(),
      discount: new Set(),
      priceRange: { max: 0, min: Infinity },
    };

    // Filter products based on the selected gender and category/subcategory
    const genderAndCategoryFilteredProducts = products.filter(product => {
      const matchesGender = gender ? product.gender === gender : true;
      const matchesCategory = category ? product.category === category : true;
      const matchesSubcategory = subcategory ? product.subcategory === subcategory : true;
      return matchesGender && matchesCategory && matchesSubcategory;
    });

    genderAndCategoryFilteredProducts.forEach(product => {
      // Collect unique categories
      if (product.category) {
        filterData.categories.add(product.category);
      }

      // Collect unique brands
      if (product.brand) {
        filterData.brands.add(product.brand);
      }

      // Collect unique colors
      if (product.colors) {
        product.colors.forEach(color => filterData.colors.add(color));
      }

      // Collect unique discount
      if (product.discount) {
        filterData.discount.add(product.discount);
      }
      // Update price range
      if (product.price && !isNaN(product.price)) {
        filterData.priceRange.max = Math.max(filterData.priceRange.max, product.price);
        filterData.priceRange.min = Math.min(filterData.priceRange.min, product.price);
      }
    });

    return {
      categories: Array.from(filterData.categories),
      brands: Array.from(filterData.brands),
      colors: Array.from(filterData.colors),
      discount: Array.from(filterData.discount),
      priceRange: filterData.priceRange,
    };
  }, [products, gender, category, subcategory]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (filterType === 'price') {
        updatedFilters.price = value;
      } else {
        const isSelected = updatedFilters[filterType].includes(value);
        updatedFilters[filterType] = isSelected
          ? updatedFilters[filterType].filter((item) => item !== value)
          : [...updatedFilters[filterType], value];
      }

      return updatedFilters;
    });
  };

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  useEffect(() => {
    setSelectedFilters({
      categories: [],
      brands: [],
      colors: [],
      discount: [],
      price: null,
    });
  }, [category, subcategory, gender]);

  return (
    <div className="category-page">

      <div className="category-content">
        <h1 className="category-title">
          {gender.charAt(0).toUpperCase() + gender.slice(1)} {category ? `- ${category}` : ''}
        </h1>
        {/* filter page for Mobile  */}
        <button className="filter-button" onClick={toggleFilterModal}>Filters</button>

        {/* Modal or Sidebar for Filters (Visible on mobile) */}
        {showFilterModal && (
          <div className="filter-modal">
            <CategorySidebar filters={filters} onFilterChange={handleFilterChange} />
            <button className="close-filter" onClick={toggleFilterModal}>Close</button>
          </div>
        )}
      </div>
      <div className="container">

        <div className="filter-product-container">
          <CategorySidebar filters={filters} onFilterChange={handleFilterChange} />
        </div>


        {filteredProducts.length != 0 ?
          <div className="category-wise-product-grid">
            {filteredProducts.map(item => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
          : <p className='empty-msg'>No products found based on the selected filters.</p>}
      </div>
    </div>
  );
}

export default CategoryPage;
