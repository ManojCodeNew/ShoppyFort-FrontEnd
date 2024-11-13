import React, { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import CategoryForm from '../../components/admin/CategoryForm';
import '../../styles/pages/admin/categories.scss';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = (category) => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...category, id: editingCategory.id } : cat
      ));
    } else {
      setCategories([...categories, { ...category, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  return (
    <div className="categories-page">
      <div className="header">
        <h1>Categories</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
        >
          <Plus /> Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-image">
              {category.image && <img src={category.image} alt={category.name} />}
            </div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              {category.parent && (
                <span className="parent-category">Parent: {category.parent}</span>
              )}
            </div>
            <div className="category-actions">
              <button 
                className="btn-icon"
                onClick={() => handleEdit(category)}
              >
                <Edit />
              </button>
              <button 
                className="btn-icon delete"
                onClick={() => handleDelete(category.id)}
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <CategoryForm 
          onSubmit={handleAddCategory}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          initialData={editingCategory}
        />
      )}
    </div>
  );
};

export default Categories;