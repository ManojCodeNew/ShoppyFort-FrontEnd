import React, { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import '../../styles/pages/admin/product-manager.scss';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = (product) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setIsFormOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  return (
    <div className="product-manager">
      <div className="products-container">
        <div className="products-header">
          <h1>Product Management</h1>
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
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="brand">{product.brand}</p>
                <p className="price">₹{product.price}</p>
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
    </div>
  );
};

export default ProductManager;