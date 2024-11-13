import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import '../../styles/components/admin/attribute-form.scss';

const AttributeForm = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'select',
    values: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addValue = () => {
    setFormData({
      ...formData,
      values: [...formData.values, '']
    });
  };

  const updateValue = (index, value) => {
    const newValues = [...formData.values];
    newValues[index] = value;
    setFormData({ ...formData, values: newValues });
  };

  const removeValue = (index) => {
    const newValues = [...formData.values];
    newValues.splice(index, 1);
    setFormData({ ...formData, values: newValues });
  };

  return (
    <div className="modal-overlay">
      <div className="attribute-form">
        <div className="form-header">
          <h2>{initialData ? 'Edit Attribute' : 'Add Attribute'}</h2>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Attribute Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter attribute name"
            />
          </div>

          <div className="form-group">
            <label>Attribute Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="select">Select</option>
              <option value="color">Color</option>
              <option value="size">Size</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
            </select>
          </div>

          <div className="form-group">
            <label>Values</label>
            <div className="values-list">
              {formData.values.map((value, index) => (
                <div key={index} className="value-item">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    placeholder="Enter value"
                  />
                  <button
                    type="button"
                    className="remove-value"
                    onClick={() => removeValue(index)}
                  >
                    <X />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary add-value"
                onClick={addValue}
              >
                <Plus /> Add Value
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? 'Update' : 'Add'} Attribute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttributeForm;