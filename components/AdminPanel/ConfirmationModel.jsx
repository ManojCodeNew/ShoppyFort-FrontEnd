import React from 'react';
import './styles/ConfirmationModel.css';
const ConfirmationModal = ({ isOpen, onClose, onConfirm, product }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm(product._id);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Delete Product</h3>
                </div>

                <div className="modal-body">
                    <p>Are you sure you want to delete <strong>"{product?.name}"</strong>?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-delete" onClick={handleConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;