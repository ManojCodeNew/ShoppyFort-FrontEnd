import React, { useState } from 'react';
import { Plus, Trash, Edit } from 'lucide-react';
import AttributeForm from '../../components/admin/AttributeForm';
import '../../styles/pages/admin/attribute-manager.scss';

const AttributeManager = () => {
  const [attributes, setAttributes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const handleAddAttribute = (attribute) => {
    if (editingAttribute) {
      setAttributes(attributes.map(a => 
        a.id === editingAttribute.id ? { ...attribute, id: editingAttribute.id } : a
      ));
      setEditingAttribute(null);
    } else {
      setAttributes([...attributes, { ...attribute, id: Date.now() }]);
    }
    setIsFormOpen(false);
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setIsFormOpen(true);
  };

  const handleDelete = (attributeId) => {
    setAttributes(attributes.filter(a => a.id !== attributeId));
  };

  return (
    <div className="attribute-manager">
      <div className="container">
        <div className="header">
          <h1>Attribute Management</h1>
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

        <div className="attributes-list">
          {attributes.map(attribute => (
            <div key={attribute.id} className="attribute-item">
              <div className="attribute-info">
                <h3>{attribute.name}</h3>
                <p>{attribute.type}</p>
                <div className="values">
                  {attribute.values.map((value, index) => (
                    <span key={index} className="value-tag">
                      {value}
                    </span>
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
    </div>
  );
};

export default AttributeManager;