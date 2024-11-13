import React, { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import '../../styles/pages/admin/products.scss';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = (product) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p
      ));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="products-page">
      <div className="header">
        <h1>Products</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        >
          <Plus /> Add Product
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.images?.[0] && <img src={product.images[0]} alt={product.name} />}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="brand">{product.brand}</p>
              <p className="price">₹{product.price}</p>
              <div className="product-meta">
                <span className="category">{product.category}</span>
                <span className="gender">{product.gender}</span>
              </div>
            </div>
            <div className="product-actions">
              <button 
                className="btn-icon"
                onClick={() => handleEdit(product)}
              >
                <Edit />
              </button>
              <button 
                className="btn-icon delete"
                onClick={() => handleDelete(product.id)}
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <ProductForm 
          onSubmit={handleAddProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default Products;