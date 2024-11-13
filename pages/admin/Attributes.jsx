import React, { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import AttributeForm from '../../components/admin/AttributeForm';
import '../../styles/pages/admin/attributes.scss';

const Attributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const handleAddAttribute = (attribute) => {
    if (editingAttribute) {
      setAttributes(attributes.map(attr => 
        attr.id === editingAttribute.id ? { ...attribute, id: editingAttribute.id } : attr
      ));
    } else {
      setAttributes([...attributes, { ...attribute, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setEditingAttribute(null);
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setIsFormOpen(true);
  };

  const handleDelete = (attributeId) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      setAttributes(attributes.filter(attr => attr.id !== attributeId));
    }
  };

  return (
    <div className="attributes-page">
      <div className="header">
        <h1>Attributes</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingAttribute(null);
            setIsFormOpen(true);
          }}
        >
          <Plus /> Add Attribute
        </button>
      </div>

      <div className="attributes-grid">
        {attributes.map(attribute => (
          <div key={attribute.id} className="attribute-card">
            <div className="attribute-info">
              <h3>{attribute.name}</h3>
              <p className="type">{attribute.type}</p>
              <div className="values">
                {attribute.values.map((value, index) => (
                  <span key={index} className="value-tag">{value}</span>
                ))}
              </div>
            </div>
            <div className="attribute-actions">
              <button 
                className="btn-icon"
                onClick={() => handleEdit(attribute)}
              >
                <Edit />
              </button>
              <button 
                className="btn-icon delete"
                onClick={() => handleDelete(attribute.id)}
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <AttributeForm 
          onSubmit={handleAddAttribute}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAttribute(null);
          }}
          initialData={editingAttribute}
        />
      )}
    </div>
  );
};

export default Attributes;