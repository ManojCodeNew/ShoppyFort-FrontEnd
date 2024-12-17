import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext.jsx';
// import products from './Request/Get.jsx';
import '../styles/components/search-bar.scss';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { products } = useProducts();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchResults = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())||
      product.gender.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log("SEARH RESULT", searchResults);

    setResults(searchResults);
    setIsOpen(true);
  };

  const handleResultClick = (product) => {
    navigate(`/product/${product._id}`);
    setQuery('');
    setIsOpen(false);
    if (onSearch) onSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for products, brands and more"
        />
        {query && (
          <button className="clear-search" onClick={clearSearch}>
            <X />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map(product => (
            <div
              key={product._id}
              className="search-result-item"
              onClick={() => handleResultClick(product)}
            >
              <img src={product.image} alt={product.name} />
              <div className="result-info">
                <h4>{product.brand}</h4>
                <p>{product.name}</p>
                <span className="price">₹{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;