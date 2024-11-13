import React, { useState, useEffect } from 'react';
import { Plus, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/pages/admin/category-manager.scss';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategory })
      });

      const data = await response.json();
      if (response.ok) {
        setCategories([...categories, data]);
        setNewCategory('');
        toast.success('Category added successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!newSubcategory.trim()) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSubcategory })
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(categories.map(cat => 
          cat._id === categoryId ? data : cat
        ));
        setNewSubcategory('');
        toast.success('Subcategory added successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add subcategory');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat._id !== categoryId));
        toast.success('Category deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(categories.map(cat => 
          cat._id === categoryId ? data : cat
        ));
        toast.success('Subcategory deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <div className="category-manager">
      <div className="header">
        <h1>Categories</h1>
      </div>

      <div className="add-category-form">
        <form onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="Enter new category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            <Plus size={16} /> Add Category
          </button>
        </form>
      </div>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category._id} className="category-card">
            <div className="category-header">
              <div className="category-name">
                <button 
                  className="expand-button"
                  onClick={() => setExpandedCategory(
                    expandedCategory === category._id ? null : category._id
                  )}
                >
                  {expandedCategory === category._id ? <ChevronUp /> : <ChevronDown />}
                </button>
                <h2>{category.name}</h2>
              </div>
              <button 
                className="delete-button"
                onClick={() => handleDeleteCategory(category._id)}
              >
                <Trash size={16} />
              </button>
            </div>

            {expandedCategory === category._id && (
              <div className="subcategories-section">
                <div className="subcategories-list">
                  {category.subcategories.map(sub => (
                    <div key={sub._id} className="subcategory-item">
                      <span>{sub.name}</span>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteSubcategory(category._id, sub._id)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add-subcategory-form">
                  <input
                    type="text"
                    placeholder="Enter new subcategory name"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                  />
                  <button 
                    className="btn-primary"
                    onClick={() => handleAddSubcategory(category._id)}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;